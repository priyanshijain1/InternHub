from risk_engine.rule_engine import calculate_rule_score
from risk_engine.ml_engine import calculate_ml_score


def calculate_hybrid_score(features: dict):

    rule_score = calculate_rule_score(features)

    ml_score = calculate_ml_score(features)

    # Hybrid weight
    final_score = (0.6 * ml_score) + (0.4 * rule_score)

    final_score = round(final_score, 3)

    if final_score > 0.7:
        label = "High Risk Scam"

    elif final_score > 0.4:
        label = "Suspicious"

    else:
        label = "Likely Legit"

    return {
        "final_score": final_score,
        "ml_score": ml_score,
        "rule_score": rule_score,
        "label": label
    }