from scraper.scraper_layer import fetch_website_data

from feature_engine.timeline_layer import check_domain_age
from feature_engine.payment_layer import check_payment_keywords
from feature_engine.website_layer import check_ssl_certificate
from feature_engine.email_layer import check_free_email
from feature_engine.nlp_layer import check_urgency_language
from feature_engine.pattern_layer import check_dangerous_patterns
from feature_engine.complaint_layer import check_complaint_database
from feature_engine.similarity_layer import check_text_similarity
from feature_engine.geo_layer import check_geo_risk
from feature_engine.contact_layer import check_contact_behavior
from feature_engine.interview_layer import check_interview_anomalies
from feature_engine.company_layer import check_company_authenticity
from feature_engine.linguistic_layer import check_linguistic_manipulation
from feature_engine.recruiter_layer import check_recruiter_authenticity
from feature_engine.document_layer import check_document_scam_signals

from risk_engine.rule_engine import calculate_rule_score


def run_detection(url, manual_text=None):
    """
    If manual_text is provided → dataset mode (no scraping).
    Otherwise → normal website detection mode.
    """

    # -----------------------------
    # Dataset Mode (NO scraping)
    # -----------------------------
    if manual_text is not None:
        data = {
            "url": url,
            "title": "",
            "text": manual_text,
            "meta_descriptions": [],
            "emails": [],
            "phones": [],
            "links": [],
            "form_count": 0,
            "script_count": 0
        }
    else:
        data = fetch_website_data(url)
        if not data:
            return None, None

    # -----------------------------
    # Feature Extraction
    # -----------------------------
    domain_risk, age_info = check_domain_age(url)
    payment_flag = check_payment_keywords(data["text"])
    ssl_risk = check_ssl_certificate(url)
    email_risk = check_free_email(data["emails"])
    nlp_risk = check_urgency_language(data["text"])

    pattern_boost = check_dangerous_patterns(
        domain_risk,
        payment_flag,
        email_risk,
        nlp_risk
    )

    complaint_risk = check_complaint_database(
        url,
        data["emails"],
        data["phones"]
    )

    similarity_risk = check_text_similarity(data["text"])
    geo_risk = check_geo_risk(url)

    contact_risk = check_contact_behavior(
        data["text"],
        data["emails"],
        data["phones"]
    )

    interview_risk = check_interview_anomalies(data["text"])

    company_risk = check_company_authenticity(
        data["text"],
        data["title"],
        data["links"],
        domain_risk
    )

    linguistic_risk = check_linguistic_manipulation(
        data["text"],
        domain_risk,
        payment_flag
    )

    recruiter_risk = check_recruiter_authenticity(
        data["text"],
        data["emails"],
        data["links"],
        domain_risk,
        payment_flag,
        email_risk
    )

    document_risk = check_document_scam_signals(
        data["text"],
        payment_flag,
        domain_risk
    )

    # -----------------------------
    # Feature Dictionary
    # -----------------------------
    features = {
        "domain_risk": domain_risk,
        "payment_flag": payment_flag,
        "ssl_risk": ssl_risk,
        "email_risk": email_risk,
        "nlp_risk": nlp_risk,
        "pattern_boost": pattern_boost,
        "complaint_risk": complaint_risk,
        "similarity_risk": similarity_risk,
        "geo_risk": geo_risk,
        "contact_risk": contact_risk,
        "interview_risk": interview_risk,
        "company_risk": company_risk,
        "linguistic_risk": linguistic_risk,
        "recruiter_risk": recruiter_risk,
        "document_risk": document_risk
    }

    rule_prob = calculate_rule_score(features)

    return features, rule_prob


if __name__ == "__main__":
    url = input("Enter Internship URL: ")

    features, rule_prob = run_detection(url)

    if features is None:
        print("Failed to fetch website.")
        exit()

    print("\n============================")
    for key, value in features.items():
        print(f"{key}: {value}")
    print("============================")

    print("Fraud Probability:", round(rule_prob * 100, 2), "%")