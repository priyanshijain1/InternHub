import os
import joblib

from model.feature_schema import dict_to_vector, FEATURE_NAMES


# Base directory (scamshield)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Path to trained model
MODEL_PATH = os.path.join(BASE_DIR, "model", "fraud_model.pkl")


# Load model once
model = joblib.load(MODEL_PATH)


def predict_risk(feature_dict):
    """
    Predict fraud risk using trained ML model.
    feature_dict comes from detection layers.
    """

    # Convert dictionary → ordered vector
    feature_vector = dict_to_vector(feature_dict)

    # Model expects 2D input
    prediction = model.predict([feature_vector])[0]

    probability = model.predict_proba([feature_vector])[0][1]

    return {
        "prediction": int(prediction),   # 0 = legit, 1 = fraud
        "fraud_probability": float(probability)
    }


# Optional test block
if __name__ == "__main__":

    # Example feature input
    sample_features = {
        "domain_risk": 0.7,
        "payment_flag": 1,
        "ssl_risk": 0.2,
        "email_risk": 0.6,
        "nlp_risk": 0.8,
        "pattern_boost": 0.5,
        "complaint_risk": 0.9,
        "similarity_risk": 0.7,
        "geo_risk": 0.3,
        "contact_risk": 0.6,
        "interview_risk": 0.8,
        "company_risk": 0.5,
        "linguistic_risk": 0.7,
        "recruiter_risk": 0.6,
        "document_risk": 0.4
    }

    result = predict_risk(sample_features)

    print("Prediction:", result["prediction"])
    print("Fraud Probability:", result["fraud_probability"])