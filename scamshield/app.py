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

from risk_engine.hybrid_engine import calculate_hybrid_score


def run_detection(url=None, description=None):

    # -----------------------------
    # Fetch data from scraper
    # -----------------------------
    data = fetch_website_data(url, description)

    if not data:
        return None, None

    # -----------------------------
    # Feature Extraction
    # -----------------------------

    domain_risk, age_info = check_domain_age(data["url"])

    payment_flag = check_payment_keywords(data["text"])

    ssl_risk = check_ssl_certificate(data["url"])

    email_risk = check_free_email(data["emails"])

    nlp_risk = check_urgency_language(data["text"])

    pattern_boost = check_dangerous_patterns(
        domain_risk,
        payment_flag,
        email_risk,
        nlp_risk
    )

    complaint_risk = check_complaint_database(
        data["url"],
        data["emails"],
        data["phones"]
    )

    similarity_risk = check_text_similarity(data["text"])

    geo_risk = check_geo_risk(data["url"])

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

    # -----------------------------
    # Description-only penalty rule
    # -----------------------------

    if url is None:

        no_links = len(data["links"]) == 0
        no_emails = len(data["emails"]) == 0
        no_phones = len(data["phones"]) == 0

        if no_links and no_emails and no_phones:

            print("⚠ No company contact information detected")

            features["contact_risk"] = min(features["contact_risk"] + 0.5, 1.0)
            features["company_risk"] = min(features["company_risk"] + 0.4, 1.0)

    # -----------------------------
    # Hybrid Engine
    # -----------------------------

    result = calculate_hybrid_score(features)

    return features, result


# -----------------------------
# CLI TEST MODE
# -----------------------------

if __name__ == "__main__":

    print("\nInternship Fraud Detection System")
    print("----------------------------------")

    url = input("Enter Internship URL (optional): ").strip()
    description = input("Enter Internship Description (optional): ").strip()

    if url == "":
        url = None

    if description == "":
        description = None

    if url is None and description is None:
        print("⚠ Please provide URL or description")
        exit()

    features, result = run_detection(url, description)

    if features is None:
        print("❌ Failed to fetch data")
        exit()

    print("\n===============================")
    print("Extracted Features")
    print("===============================")

    for key, value in features.items():
        print(f"{key}: {value}")

    print("\n===============================")
    print("Fraud Analysis Result")
    print("===============================")

    print("Rule Score :", result["rule_score"])
    print("ML Score   :", result["ml_score"])
    print("Final Score:", result["final_score"])
    print("Label      :", result["label"])