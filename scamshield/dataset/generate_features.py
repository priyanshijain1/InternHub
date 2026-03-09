import sys
import os

# Fix import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
from model.feature_schema import FEATURE_NAMES
from app import run_detection

BASE_DIR = os.path.dirname(__file__)

INPUT_FILE = os.path.join(BASE_DIR, "final_real_fraud_dataset.csv")
OUTPUT_FILE = os.path.join(BASE_DIR, "processed_dataset.csv")


def generate():

    df = pd.read_csv(INPUT_FILE)

    processed_rows = []

    for idx, row in df.iterrows():

        text = str(row["description"])
        label = int(row["label"])

        dummy_url = "https://example.com"

        features, _ = run_detection(dummy_url, manual_text=text)

        if features:
            features["label"] = label
            processed_rows.append(features)

        if idx % 100 == 0:
            print(f"Processed {idx} rows")

    final_df = pd.DataFrame(processed_rows)

    final_df = final_df[FEATURE_NAMES + ["label"]]

    final_df.to_csv(OUTPUT_FILE, index=False)

    print("\n✅ Processed dataset saved successfully.")


if __name__ == "__main__":
    generate()