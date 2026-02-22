import re

def check_company_authenticity(text, title, links, domain_risk):

    text_lower = text.lower()
    risk_score = 0.0

    # ----------------------------
    # About Page Link Check
    # ----------------------------
    about_link_found = any(
        "about" in (link.lower() if link else "")
        for link in links
    )

    if not about_link_found:
        print("⚠ No About page link detected")
        risk_score += 0.1

    # ----------------------------
    #  Company Registration Pattern (Only if domain is new)
    # ----------------------------
    if domain_risk > 0.3:  # only check for new domains
        cin_pattern = r"[A-Z]{1}\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}"
        gst_pattern = r"\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}[A-Z\d]{1}"

        cin_match = re.search(cin_pattern, text)
        gst_match = re.search(gst_pattern, text)

        if not cin_match and not gst_match:
            print("⚠ New domain with no registration number")
            risk_score += 0.2

    # ----------------------------
    #  Suspicious Title
    # ----------------------------
    suspicious_titles = [
        "earn money fast",
        "work from home income",
        "limited seats internship"
    ]

    for keyword in suspicious_titles:
        if keyword in title.lower():
            print("⚠ Suspicious company title detected")
            risk_score += 0.3
            break

    if risk_score > 0.4:
        risk_score = 0.4

    return risk_score