
import json
import pandas as pd

RAW_DATA_PATH = "app/ml/data/worldcities.csv"
PROCESSED_DATA_PATH = "app/ml/data/processed_destinations.csv"

# Interest/trip-type columns already present in the raw dataset as 1-5 scores.
INTEREST_COLUMNS = [
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

# Mapping used to convert budget_level into an ordinal number for KNN distance
# (Budget < Mid-range < Luxury forms a natural order, so ordinal encoding is
# more meaningful here than one-hot encoding).
BUDGET_ORDINAL_MAP = {
    "Budget": 0,
    "Mid-range": 1,
    "Luxury": 2,
}


def compute_avg_annual_temp(avg_temp_monthly_json: str) -> float:
    """
    Parses the avg_temp_monthly JSON string and returns the mean of the
    12 monthly 'avg' temperatures, rounded to 1 decimal place.
    """
    try:
        monthly_data = json.loads(avg_temp_monthly_json)
        monthly_avgs = [month["avg"] for month in monthly_data.values()]
        return round(sum(monthly_avgs) / len(monthly_avgs), 1)
    except (json.JSONDecodeError, TypeError, KeyError, ZeroDivisionError):
        # If a row has malformed temperature data, we return None so it can
        # be dropped later rather than silently poisoning the dataset.
        return None


def load_and_preprocess() -> pd.DataFrame:
    df = pd.read_csv(RAW_DATA_PATH)

    # Drop rows missing critical fields we depend on downstream.
    required_columns = ["city", "country", "region", "budget_level", "avg_temp_monthly"] + INTEREST_COLUMNS
    df = df.dropna(subset=required_columns)

    # Engineer the single annual average temperature feature (Option A).
    df["avg_annual_temp"] = df["avg_temp_monthly"].apply(compute_avg_annual_temp)
    df = df.dropna(subset=["avg_annual_temp"])

    # Encode budget_level as an ordinal number for KNN.
    df["budget_ordinal"] = df["budget_level"].map(BUDGET_ORDINAL_MAP)
    df = df.dropna(subset=["budget_ordinal"])
    df["budget_ordinal"] = df["budget_ordinal"].astype(int)

    # Final column selection: identifiers/display fields + KNN feature fields.
    display_columns = [
        "id",
        "city",
        "country",
        "region",
        "short_description",
        "budget_level",
        "avg_annual_temp",
    ]
    feature_columns = ["budget_ordinal", "avg_annual_temp"] + INTEREST_COLUMNS

    final_columns = list(dict.fromkeys(display_columns + feature_columns))
    processed_df = df[final_columns].reset_index(drop=True)

    return processed_df


if __name__ == "__main__":
    processed_df = load_and_preprocess()
    processed_df.to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"Processed {len(processed_df)} destinations.")
    print(f"Saved to {PROCESSED_DATA_PATH}")
    print("\nFeature columns used for KNN:")
    print(["budget_ordinal", "avg_annual_temp"] + INTEREST_COLUMNS)
    print("\nSample row:")
    print(processed_df.head(1).to_string())