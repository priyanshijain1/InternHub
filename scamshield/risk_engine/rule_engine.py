def calculate_rule_score(features: dict):

    score = 0.0

    # Add all numeric feature values except payment_flag special handling
    for key, value in features.items():
        if key != "payment_flag":
            score += value

    # Payment flag special boost
    if features.get("payment_flag", 0) == 1:
        score += 0.4

    # Cap final score
    if score > 1:
        score = 1.0

    return score