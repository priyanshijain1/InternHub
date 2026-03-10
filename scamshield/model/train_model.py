import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report


DATA_FILE = "dataset/processed_dataset.csv"
MODEL_FILE = "model/fraud_model.pkl"


def train():

    print("Loading dataset...")
    df = pd.read_csv(DATA_FILE)

    X = df.drop("label", axis=1)
    y = df["label"]

    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        random_state=42
    )

    model.fit(X_train, y_train)

    print("Evaluating model...")
    predictions = model.predict(X_test)

    print(classification_report(y_test, predictions))

    print("Saving model...")
    joblib.dump(model, MODEL_FILE)

    print("✅ Model saved:", MODEL_FILE)


if __name__ == "__main__":
    train()