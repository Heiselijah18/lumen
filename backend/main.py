from datetime import datetime
from typing import List

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import auth
import schemas
from database import Base, engine, get_db
from lumen_ai import get_lumen_reply, contains_crisis_language
from models import (
    User,
    RoleEnum,
    PlanEnum,
    MoodLog,
    ChatMessage,
    Assignment,
    TherapistProfile,
    Subscription,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lumen API")

import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ------------------------------------------------------------------ #
# Auth dependencies
# ------------------------------------------------------------------ #

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = auth.decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(role: RoleEnum):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role != role:
            raise HTTPException(status_code=403, detail=f"Requires {role.value} account")
        return user

    return checker


require_client = require_role(RoleEnum.client)
require_therapist = require_role(RoleEnum.therapist)


# ------------------------------------------------------------------ #
# Auth endpoints
# ------------------------------------------------------------------ #

@app.post("/signup", response_model=schemas.UserOut)
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Set up role-specific records
    if user.role == RoleEnum.client:
        db.add(Subscription(client_id=user.id, plan=PlanEnum.free, status="active"))
    else:
        db.add(TherapistProfile(user_id=user.id, bio="", specialties="", license_number=""))
    db.commit()

    return user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses "username" as the field name; we treat it as email.
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = auth.create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ------------------------------------------------------------------ #
# Mood check-ins (client)
# ------------------------------------------------------------------ #

@app.post("/mood", response_model=schemas.MoodOut)
def log_mood(payload: schemas.MoodIn, db: Session = Depends(get_db), user: User = Depends(require_client)):
    if not 1 <= payload.value <= 5:
        raise HTTPException(status_code=400, detail="Mood value must be between 1 and 5")

    entry = MoodLog(client_id=user.id, value=payload.value)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/mood", response_model=List[schemas.MoodOut])
def my_moods(db: Session = Depends(get_db), user: User = Depends(require_client)):
    return (
        db.query(MoodLog)
        .filter(MoodLog.client_id == user.id)
        .order_by(MoodLog.created_at.desc())
        .limit(30)
        .all()
    )


# ------------------------------------------------------------------ #
# Chat with Lumen (client)
# ------------------------------------------------------------------ #

@app.get("/chat", response_model=List[schemas.ChatMessageOut])
def chat_history(db: Session = Depends(get_db), user: User = Depends(require_client)):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.client_id == user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


@app.post("/chat", response_model=schemas.ChatReply)
def chat(payload: schemas.ChatIn, db: Session = Depends(get_db), user: User = Depends(require_client)):
    crisis = contains_crisis_language(payload.message)

    user_msg = ChatMessage(
        client_id=user.id,
        role="user",
        content=payload.message,
        flagged_crisis=1 if crisis else 0,
    )
    db.add(user_msg)
    db.commit()

    # Build conversation history for the model (last 20 messages)
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.client_id == user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    api_messages = [{"role": m.role, "content": m.content} for m in history[-20:]]

    reply_text = get_lumen_reply(api_messages)

    assistant_msg = ChatMessage(client_id=user.id, role="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()

    return {"reply": reply_text, "crisis_detected": crisis}


# ------------------------------------------------------------------ #
# Subscriptions (client)
# ------------------------------------------------------------------ #

@app.get("/subscription", response_model=schemas.SubscriptionOut)
def my_subscription(db: Session = Depends(get_db), user: User = Depends(require_client)):
    sub = db.query(Subscription).filter(Subscription.client_id == user.id).first()
    if not sub:
        sub = Subscription(client_id=user.id, plan=PlanEnum.free, status="active")
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


@app.post("/subscription", response_model=schemas.SubscriptionOut)
def update_subscription(
    payload: schemas.SubscribeIn, db: Session = Depends(get_db), user: User = Depends(require_client)
):
    """
    Demo-only plan switch. In production, this should instead create a Stripe
    Checkout session / Subscription and update the plan via a Stripe webhook
    once payment succeeds.
    """
    sub = db.query(Subscription).filter(Subscription.client_id == user.id).first()
    if not sub:
        sub = Subscription(client_id=user.id)
        db.add(sub)

    sub.plan = payload.plan
    sub.status = "active"
    db.commit()
    db.refresh(sub)
    return sub


# ------------------------------------------------------------------ #
# Therapist endpoints
# ------------------------------------------------------------------ #

@app.get("/therapist/clients", response_model=List[schemas.ClientSummary])
def my_clients(db: Session = Depends(get_db), therapist: User = Depends(require_therapist)):
    assignments = db.query(Assignment).filter(Assignment.therapist_id == therapist.id).all()
    client_ids = [a.client_id for a in assignments]
    clients = db.query(User).filter(User.id.in_(client_ids)).all()

    results = []
    for client in clients:
        moods = (
            db.query(MoodLog)
            .filter(MoodLog.client_id == client.id)
            .order_by(MoodLog.created_at.asc())
            .all()
        )
        history = [m.value for m in moods][-7:]
        results.append(
            schemas.ClientSummary(
                id=client.id,
                name=client.name,
                email=client.email,
                latest_mood=history[-1] if history else None,
                mood_history=history,
            )
        )
    return results


@app.post("/therapist/claim/{client_id}")
def claim_client(client_id: int, db: Session = Depends(get_db), therapist: User = Depends(require_therapist)):
    """Assigns a client (who currently has no therapist) to this therapist."""
    client = db.query(User).filter(User.id == client_id, User.role == RoleEnum.client).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    existing = db.query(Assignment).filter(Assignment.client_id == client_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client already has a therapist")

    db.add(Assignment(client_id=client_id, therapist_id=therapist.id))
    db.commit()
    return {"status": "assigned"}


@app.get("/therapist/profile", response_model=schemas.TherapistProfileOut)
def therapist_profile(db: Session = Depends(get_db), therapist: User = Depends(require_therapist)):
    profile = db.query(TherapistProfile).filter(TherapistProfile.user_id == therapist.id).first()
    return profile


@app.put("/therapist/profile", response_model=schemas.TherapistProfileOut)
def update_therapist_profile(
    bio: str = "",
    specialties: str = "",
    license_number: str = "",
    db: Session = Depends(get_db),
    therapist: User = Depends(require_therapist),
):
    profile = db.query(TherapistProfile).filter(TherapistProfile.user_id == therapist.id).first()
    profile.bio = bio
    profile.specialties = specialties
    profile.license_number = license_number
    db.commit()
    db.refresh(profile)
    return profile


@app.get("/")
def root():
    return {"status": "Lumen API is running", "time": datetime.utcnow().isoformat()}
