def calculate_rule_score(features: dict):

    score = 0.0

    # Add all feature values except payment_flag
    for key, value in features.items():

        if key != "payment_flag":
            try:
                score += float(value)
            except:
                pass

    # Payment scam boost
    if features.get("payment_flag", 0) == 1:
        score += 0.4

    # Cap score
    if score > 1:
        score = 1.0

    return round(score, 3)