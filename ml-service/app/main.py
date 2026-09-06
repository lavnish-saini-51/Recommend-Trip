from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.recommend_router import router as recommend_router
from app.routers.chat_router import router as chat_router

app = FastAPI(
    title="RecommendTrip ML Service",
    description="Serves KNN-based travel destination recommendations and an LLM-powered chat layer scoped to a selected destination.",
    version="1.0.0",
)

# Allow the Vite dev server (default port 5173) to call this API.
# In production, replace "*" with the actual deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend_router)
app.include_router(chat_router)


@app.get("/")
async def health_check():
    """Simple health check endpoint to confirm the service is running."""
    return {"status": "ok", "service": "RecommendTrip ML Service"}
