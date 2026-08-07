from fastapi import APIRouter, HTTPException

from app.schemas.recommend_schema import RecommendRequest, RecommendResponse
from app.services.recommend_service import get_recommendations

router = APIRouter(prefix="/recommend", tags=["recommend"])


@router.post("", response_model=RecommendResponse)
async def recommend_destinations(preferences: RecommendRequest) -> RecommendResponse:
    """
    Accepts structured user preferences and returns a ranked list of
    recommended destinations based on the trained KNN model.
    """
    try:
        recommendations = get_recommendations(preferences)
    except Exception as error:
        
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while generating recommendations. Please try again.",
        ) from error

    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail="No matching destinations found for the given preferences.",
        )

    return RecommendResponse(recommendations=recommendations)