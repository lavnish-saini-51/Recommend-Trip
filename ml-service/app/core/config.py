import os
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-medium-3-5"

if not MISTRAL_API_KEY:
    # We don't crash the whole app on import (so /recommend still works
    # even if the LLM key is missing during ML-only development), but we
    # log a clear warning so it's obvious why /chat will fail.
    print("WARNING: MISTRAL_API_KEY is not set. /chat endpoint will fail until it is configured in .env")