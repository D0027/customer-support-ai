"""
Pydantic request/response schemas used across the API.
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field
import uuid


# ---------- Auth / User ----------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Chat ----------

AgentType = Literal["billing", "technical", "product", "complaint", "faq", "general"]


class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    message: str
    language: Optional[str] = "en"  # bonus: multilingual support


class SourceChunk(BaseModel):
    source: str
    text: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    agents_invoked: list[AgentType]
    sentiment: Optional[str] = None          # bonus: sentiment analysis
    escalated: bool = False                   # bonus: human handoff
    ticket_id: Optional[str] = None           # bonus: auto ticket creation
    sources: list[SourceChunk] = []


class MessageOut(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
    agent: Optional[str] = None
    ticket_id: Optional[str] = None


class ConversationHistory(BaseModel):
    session_id: str
    messages: list[MessageOut]


# ---------- Tickets (bonus: automatic ticket creation) ----------

class TicketOut(BaseModel):
    ticket_id: str
    session_id: str
    subject: str
    description: str
    status: Literal["open", "in_progress", "resolved"] = "open"
    priority: Literal["low", "medium", "high"] = "medium"
    created_at: datetime


# ---------- Feedback (bonus: satisfaction analytics) ----------

class FeedbackIn(BaseModel):
    session_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


# ---------- Analytics (Module 9) ----------

class AnalyticsSummary(BaseModel):
    total_conversations: int
    agent_usage: dict[str, int]
    avg_response_time_ms: float
    avg_satisfaction: Optional[float] = None
    thumbs_up: int = 0
    thumbs_down: int = 0

class ReactionIn(BaseModel):
    session_id: str
    message_index: int
    reaction: Literal["up", "down"]    

class UserUpdate(BaseModel):
    name: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

class CannedResponseIn(BaseModel):
    title: str
    content: str