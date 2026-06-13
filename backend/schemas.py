from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr

from models import RoleEnum, PlanEnum


# ---------- Auth ----------

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Users ----------

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Mood ----------

class MoodIn(BaseModel):
    value: int  # 1-5


class MoodOut(BaseModel):
    id: int
    value: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Chat ----------

class ChatIn(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    flagged_crisis: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatReply(BaseModel):
    reply: str
    crisis_detected: bool


# ---------- Therapist ----------

class TherapistProfileOut(BaseModel):
    bio: str
    specialties: str
    license_number: str

    class Config:
        from_attributes = True


class ClientSummary(BaseModel):
    id: int
    name: str
    email: EmailStr
    latest_mood: Optional[int] = None
    mood_history: List[int] = []

    class Config:
        from_attributes = True


# ---------- Subscription ----------

class SubscriptionOut(BaseModel):
    plan: PlanEnum
    status: str

    class Config:
        from_attributes = True


class SubscribeIn(BaseModel):
    plan: PlanEnum
