import logging

import requests
from fastapi import APIRouter, HTTPException

from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.chat_service import get_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


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
    except requests.exceptions.HTTPError as error:
        response = error.response
        logger.error(
            "Mistral API rejected chat request: status=%s body=%s",
            response.status_code if response is not None else "unknown",
            response.text[:1000] if response is not None else str(error),
        )
        if response is not None and response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="The AI assistant is temporarily rate-limited. Please wait a moment and try again.",
                headers={
                    "Retry-After": response.headers.get("Retry-After", "10"),
                },
            ) from error
        raise HTTPException(
            status_code=502,
            detail="The AI assistant rejected the request. Check the backend log for the provider error.",
        ) from error
    except requests.exceptions.RequestException as error:
        logger.error("Could not reach Mistral API: %s", error)
        raise HTTPException(
            status_code=502,
            detail="Could not reach the AI assistant service. Please try again.",
        ) from error

    return ChatResponse(reply=reply)
