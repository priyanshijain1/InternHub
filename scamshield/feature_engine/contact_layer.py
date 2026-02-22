def check_contact_behavior(text, emails, phones):

    text_lower = text.lower()
    risk_score = 0.0

    # ----------------------------
    #  WhatsApp / Telegram Only Contact
    # ----------------------------
    if "whatsapp" in text_lower and len(emails) == 0:
        print("⚠ WhatsApp-only contact detected")
        risk_score += 0.3

    if "telegram" in text_lower:
        print("⚠ Telegram communication detected")
        risk_score += 0.2

    # ----------------------------
    # No Phone Number Found
    # ----------------------------
    if len(phones) == 0:
        print("⚠ No phone number found")
        risk_score += 0.1

    # ----------------------------
    #  Personal Email Domains
    # ----------------------------
    for email in emails:
        if any(domain in email.lower() for domain in ["gmail", "yahoo", "outlook", "proton"]):
            print("⚠ Personal email used for business contact")
            risk_score += 0.2
            break

    # Cap risk
    if risk_score > 0.5:
        risk_score = 0.5

    return risk_score