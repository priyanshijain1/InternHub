def check_linguistic_manipulation(text, domain_risk, payment_flag):

    risk_score = 0.0
    words = text.split()
    total_words = len(words)

    if total_words == 0:
        return 0.0

    text_lower = text.lower()

    # ALL CAPS overuse
    caps_words = [word for word in words if word.isupper() and len(word) > 3]
    if len(caps_words) / total_words > 0.05:
        print("⚠ Excessive ALL CAPS usage detected")
        risk_score += 0.2

    # Excessive exclamation
    if text.count("!") > 15:
        print("⚠ Excessive exclamation marks detected")
        risk_score += 0.2

    # Context-aware income detection
    income_keywords = [
        "earn", "income", "salary",
        "stipend", "per month", "₹", "rs"
    ]

    income_count = sum(text_lower.count(word) for word in income_keywords)

    if income_count > 20 and (domain_risk > 0.3 or payment_flag == 1):
        print("⚠ Suspicious repeated income claims")
        risk_score += 0.3

    if risk_score > 0.4:
        risk_score = 0.4

    return risk_score