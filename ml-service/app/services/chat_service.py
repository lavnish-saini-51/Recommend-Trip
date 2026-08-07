import requests

from app.core.config import MISTRAL_API_KEY, MISTRAL_API_URL, MISTRAL_MODEL
from app.schemas.chat_schema import ChatRequest

REQUEST_TIMEOUT_SECONDS = 20


def build_system_prompt(destination) -> str:
   
    return (
        "You are a friendly, knowledgeable travel assistant helping a user "
        f"learn about {destination.city}, {destination.country}. "
        "Only answer questions about this specific destination. "
        "Here are the real facts about it:\n"
        f"- Region: {destination.region}\n"
        f"- Budget level: {destination.budget_level}\n"
        f"- Average annual temperature: {destination.avg_annual_temp}°C\n"
        f"- Description: {destination.short_description}\n\n"
        "Do not suggest or invent alternative destinations. Do not claim "
        "this destination is unsuitable and recommend another one — the "
        "user has already chosen it via a separate recommendation system. "
        "Keep answers concise, helpful, and conversational."
    )


def get_chat_reply(chat_request: ChatRequest) -> str:
    
    if not MISTRAL_API_KEY:
        raise RuntimeError("MISTRAL_API_KEY is not configured on the server.")

    messages = [{"role": "system", "content": build_system_prompt(chat_request.destination)}]

    for turn in chat_request.conversation_history:
        messages.append({"role": turn.role, "content": turn.content})

    messages.append({"role": "user", "content": chat_request.message})

    response = requests.post(
        MISTRAL_API_URL,
        headers={
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MISTRAL_MODEL,
            "messages": messages,
            "temperature": 0.7,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"]