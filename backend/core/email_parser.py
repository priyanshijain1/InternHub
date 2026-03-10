import re


def rule_based_parser(subject, body):

    text = (subject + " " + body).lower()

    if "online assessment" in text or "coding test" in text:
        return "oa"

    if "interview" in text or "schedule" in text:
        return "interview"

    if "regret to inform" in text or "unfortunately" in text:
        return "rejection"

    if "congratulations" in text or "offer" in text:
        return "offer"

    if "application received" in text or "thanks for applying" in text:
        return "applied"

    return None