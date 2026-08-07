import joblib
import pandas as pd

from app.schemas.recommend_schema import RecommendRequest, RecommendedDestination

MODEL_PATH = "app/ml/trained_model/knn_model.joblib"
SCALER_PATH = "app/ml/trained_model/scaler.joblib"
PROCESSED_DATA_PATH = "app/ml/data/processed_destinations.csv"

FEATURE_COLUMNS = [
    "budget_ordinal",
    "avg_annual_temp",
    "culture",
    "adventure",
    "nature",
    "beaches",
    "nightlife",
    "cuisine",
    "wellness",
    "urban",
    "seclusion",
]

BUDGET_ORDINAL_MAP = {
    "Budget": 0,
    "Mid-range": 1,
    "Luxury": 2,
}

NUM_RECOMMENDATIONS = 5

# Loaded once at module import time, not per-request, since re-loading
# a joblib model and CSV on every API call would be wasteful.
_knn_model = joblib.load(MODEL_PATH)
_scaler = joblib.load(SCALER_PATH)
_destinations_df = pd.read_csv(PROCESSED_DATA_PATH)


def get_recommendations(preferences: RecommendRequest) -> list[RecommendedDestination]:
    """
    Converts user preferences into a feature vector, queries the trained
    KNN model, and returns the top matching destinations with their real
    dataset attributes.
    """
    feature_vector = [[
        BUDGET_ORDINAL_MAP[preferences.budget_level],
        preferences.preferred_temp,
        preferences.culture,
        preferences.adventure,
        preferences.nature,
        preferences.beaches,
        preferences.nightlife,
        preferences.cuisine,
        preferences.wellness,
        preferences.urban,
        preferences.seclusion,
    ]]

    scaled_vector = _scaler.transform(feature_vector)
    distances, indices = _knn_model.kneighbors(scaled_vector, n_neighbors=NUM_RECOMMENDATIONS)

    recommendations = []
    for idx, distance in zip(indices[0], distances[0]):
        row = _destinations_df.iloc[idx]
        recommendations.append(
            RecommendedDestination(
                id=row["id"],
                city=row["city"],
                country=row["country"],
                region=row["region"],
                short_description=row["short_description"],
                budget_level=row["budget_level"],
                avg_annual_temp=row["avg_annual_temp"],
                match_score=round(float(distance), 3),
            )
        )

    return recommendations