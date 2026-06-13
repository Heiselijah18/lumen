import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class RoleEnum(str, enum.Enum):
    client = "client"
    therapist = "therapist"


class PlanEnum(str, enum.Enum):
    free = "free"
    plus = "plus"
    therapy = "therapy"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    therapist_profile = relationship(
        "TherapistProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    mood_logs = relationship("MoodLog", back_populates="client", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="client", cascade="all, delete-orphan")
    subscription = relationship(
        "Subscription", back_populates="client", uselist=False, cascade="all, delete-orphan"
    )


class TherapistProfile(Base):
    __tablename__ = "therapist_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, default="")
    specialties = Column(String, default="")
    license_number = Column(String, default="")

    user = relationship("User", back_populates="therapist_profile")


class Assignment(Base):
    """Links a client to the therapist supporting them."""

    __tablename__ = "assignments"
    __table_args__ = (UniqueConstraint("client_id", name="uq_assignment_client"),)

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    value = Column(Integer, nullable=False)  # 1 (heavy) - 5 (great)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", back_populates="mood_logs")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    flagged_crisis = Column(Integer, default=0)  # 1 if crisis language detected
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", back_populates="chat_messages")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    plan = Column(Enum(PlanEnum), default=PlanEnum.free)
    status = Column(String, default="active")
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("User", back_populates="subscription")
