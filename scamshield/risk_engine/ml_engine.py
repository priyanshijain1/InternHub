import sys
import os
import joblib

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from model.feature_schema import dict_to_vector

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model", "fraud_model.pkl"))

try:
    model = joblib.load(MODEL_PATH)
except Exception:
    model = None


def calculate_ml_score(features: dict):

    if model is None:
        return 0.0

    vector = dict_to_vector(features)
    probability = model.predict_proba([vector])[0][1]

    return round(float(probability), 3)
