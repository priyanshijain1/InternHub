def check_dangerous_patterns(domain_risk, payment_flag, email_risk, nlp_risk):
    boost = 0.0

    # Pattern 1: New domain + Payment
    if domain_risk >= 0.2 and payment_flag == 1:
        boost += 0.3

    # Pattern 2: Free email + High NLP pressure
    if email_risk >= 0.2 and nlp_risk >= 0.2:
        boost += 0.2

    # Pattern 3: Payment + NLP manipulation
    if payment_flag == 1 and nlp_risk >= 0.2:
        boost += 0.3

    # Cap boost
    if boost > 0.5:
        boost = 0.5

    return boost