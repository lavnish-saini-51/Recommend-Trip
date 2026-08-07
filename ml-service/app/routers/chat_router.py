import requests
from fastapi import APIRouter, HTTPException

from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.chat_service import get_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat_about_destination(chat_request: ChatRequest) -> ChatResponse:
    """
    Accepts a message scoped to a selected destination (plus conversation
    history) and returns the LLM's reply, grounded in that destination's
    real attributes.
    """
    try:
        reply = get_chat_reply(chat_request)
    except RuntimeError as error:
        # Raised when MISTRAL_API_KEY is missing — a server config issue.
        raise HTTPException(status_code=500, detail=str(error)) from error
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="The AI assistant took too long to respond. Please try again.",
        )
    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail="Could not reach the AI assistant service. Please try again.",
        ) from error

    return ChatResponse(reply=reply)