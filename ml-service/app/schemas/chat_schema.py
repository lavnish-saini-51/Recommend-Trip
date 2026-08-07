from pydantic import BaseModel, Field
from typing import Literal


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class DestinationContext(BaseModel):
    city: str
    country: str
    region: str
    short_description: str
    budget_level: str
    avg_annual_temp: float


class ChatRequest(BaseModel):
    destination: DestinationContext = Field(
        ..., description="The destination this conversation is scoped to"
    )
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_history: list[ChatMessage] = Field(
        default_factory=list,
        description="Prior turns in this session, oldest first",
    )


class ChatResponse(BaseModel):
    reply: str