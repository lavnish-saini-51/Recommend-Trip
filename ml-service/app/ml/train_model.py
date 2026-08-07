import joblib
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

PROCESSED_DATA_PATH = "app/ml/data/processed_destinations.csv"
MODEL_OUTPUT_PATH = "app/ml/trained_model/knn_model.joblib"
SCALER_OUTPUT_PATH = "app/ml/trained_model/scaler.joblib"

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

# Number of neighbors returned by default. We fetch a few extra so the
# /recommend endpoint can filter/dedupe if needed, without retraining.
N_NEIGHBORS = 10


def train_and_save_model():
    df = pd.read_csv(PROCESSED_DATA_PATH)
    features = df[FEATURE_COLUMNS].values

    # Scale features so that columns with larger numeric ranges (like
    # avg_annual_temp, roughly -20 to 35) don't dominate the distance
    # calculation over 1-5 interest scores or the 0-2 budget ordinal.
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    knn_model = NearestNeighbors(n_neighbors=N_NEIGHBORS, metric="euclidean")
    knn_model.fit(scaled_features)

    joblib.dump(knn_model, MODEL_OUTPUT_PATH)
    joblib.dump(scaler, SCALER_OUTPUT_PATH)

    print(f"Trained KNN model on {len(df)} destinations using {len(FEATURE_COLUMNS)} features.")
    print(f"Model saved to {MODEL_OUTPUT_PATH}")
    print(f"Scaler saved to {SCALER_OUTPUT_PATH}")

    sanity_check(df, scaler, knn_model)


def sanity_check(df: pd.DataFrame, scaler: StandardScaler, knn_model: NearestNeighbors):
    """
    Prints nearest neighbors for a made-up 'beach lover, warm climate,
    mid-range budget' preference vector, so we can visually confirm the
    model returns sensible results before wiring it into the API.
    """
    sample_preference = {
        "budget_ordinal": 1,       # Mid-range
        "avg_annual_temp": 27,     # Warm
        "culture": 2,
        "adventure": 2,
        "nature": 3,
        "beaches": 5,              # Strong beach preference
        "nightlife": 3,
        "cuisine": 3,
        "wellness": 2,
        "urban": 1,
        "seclusion": 2,
    }
    sample_vector = [[sample_preference[col] for col in FEATURE_COLUMNS]]
    scaled_sample = scaler.transform(sample_vector)

    distances, indices = knn_model.kneighbors(scaled_sample, n_neighbors=5)

    print("\nSanity check — top 5 matches for a 'warm, mid-range, beach lover' profile:")
    for rank, (idx, dist) in enumerate(zip(indices[0], distances[0]), start=1):
        row = df.iloc[idx]
        print(f"{rank}. {row['city']}, {row['country']} (dist={dist:.2f}, "
              f"beaches={row['beaches']}, temp={row['avg_annual_temp']}, budget={row['budget_level']})")


if __name__ == "__main__":
    train_and_save_model()