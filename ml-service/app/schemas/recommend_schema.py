from pydantic import BaseModel, Field
from typing import Literal


class RecommendRequest(BaseModel):
    budget_level: Literal["Budget", "Mid-range", "Luxury"] = Field(
        ..., description="User's preferred budget tier"
    )
    preferred_temp: float = Field(
        ..., ge=-20, le=45, description="User's preferred average temperature in Celsius"
    )
    culture: int = Field(..., ge=1, le=5)
    adventure: int = Field(..., ge=1, le=5)
    nature: int = Field(..., ge=1, le=5)
    beaches: int = Field(..., ge=1, le=5)
    nightlife: int = Field(..., ge=1, le=5)
    cuisine: int = Field(..., ge=1, le=5)
    wellness: int = Field(..., ge=1, le=5)
    urban: int = Field(..., ge=1, le=5)
    seclusion: int = Field(..., ge=1, le=5)
    group_size: int = Field(..., ge=1, le=20, description="Number of travelers")
    preferred_month: int = Field(
        ..., ge=1, le=12, description="Preferred travel month, used for display only"
    )


class RecommendedDestination(BaseModel):
    id: str
    city: str
    country: str
    region: str
    short_description: str
    budget_level: str
    avg_annual_temp: float
    match_score: float = Field(..., description="Similarity score, lower distance = better match")


class RecommendResponse(BaseModel):
    recommendations: list[RecommendedDestination]