import pandas as pd
import tldextract
from difflib import SequenceMatcher


def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()


def check_complaint_database(url, emails, phones):
    try:
        df = pd.read_csv("database/complaints.csv")

        extracted = tldextract.extract(url)
        domain = f"{extracted.domain}.{extracted.suffix}"

        risk_score = 0.0

        # ----------------------------
        #  Exact Domain Match
        # ----------------------------
        if domain in df["domain"].values:
            print("⚠ Exact domain match found in complaint DB")
            risk_score += 0.6

        # ----------------------------
        #  Similar Domain Match (Fuzzy)
        # ----------------------------
        for reported_domain in df["domain"]:
            sim = similarity(domain, reported_domain)
            if sim > 0.8 and domain != reported_domain:
                print("⚠ Similar domain match found:", reported_domain)
                risk_score += 0.4
                break

        # ----------------------------
        # Phone Number Match
        # ----------------------------
        for phone in phones:
            if phone in df["reported_phone"].values:
                print("⚠ Phone number linked to scam DB")
                risk_score += 0.5
                break

        # ----------------------------
        #  Email Match
        # ----------------------------
        for email in emails:
            if email in df["reported_email"].values:
                print("⚠ Email linked to scam DB")
                risk_score += 0.5
                break

        # Cap risk
        if risk_score > 0.8:
            risk_score = 0.8

        return risk_score

    except Exception as e:
        print("Complaint DB error:", e)
        return 0.0