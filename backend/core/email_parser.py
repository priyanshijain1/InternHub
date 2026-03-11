import re

def rule_based_parser(subject, body, sender=""):

    text = f"{subject} {body}".lower()
    sender = sender.lower()

    # -----------------------------
    # 1️⃣ IGNORE NON-JOB EMAILS
    # -----------------------------

    ignored_domains = [
        "medium.com",
        "substack.com",
        "leetcode.com",
        "codeforces.com",
        "codechef.com",
        "hackerrank.com",
        "newsletter",
        "dev.to",
        "towardsdatascience",
        "producthunt",
        "udemy",
        "coursera",
        "edx"
    ]

    ignored_keywords = [
        "contest",
        "weekly digest",
        "newsletter",
        "new article",
        "blog post",
        "recommended for you",
        "daily digest",
        "promotion",
        "sale",
        "limited offer",
        "black friday",
        "course update",
        "new course",
        "community update",
        "top posts",
        "trending article"
    ]

    if any(domain in sender for domain in ignored_domains):
        return None

    if any(keyword in text for keyword in ignored_keywords):
        return None


    # -----------------------------
    # 2️⃣ REJECTION DETECTION
    # -----------------------------

    rejection_patterns = [
        r"regret to inform",
        r"unfortunately",
        r"not selected",
        r"will not be moving forward",
        r"we cannot proceed",
        r"position has been filled",
        r"we regret",
        r"after careful consideration"
    ]

    if any(re.search(p, text) for p in rejection_patterns):
        return "rejection"


    # -----------------------------
    # 3️⃣ OFFER DETECTION
    # -----------------------------

    offer_patterns = [
        r"offer letter",
        r"pleased to offer",
        r"excited to offer",
        r"congratulations.*offer",
        r"we are happy to offer",
        r"job offer",
        r"internship offer"
    ]

    if any(re.search(p, text) for p in offer_patterns):
        return "offer"


    # -----------------------------
    # 4️⃣ INTERVIEW DETECTION
    # -----------------------------

    interview_patterns = [
        r"interview",
        r"technical interview",
        r"interview round",
        r"schedule.*interview",
        r"interview invitation",
        r"panel interview",
        r"zoom interview",
        r"meet with our team"
    ]

    if any(re.search(p, text) for p in interview_patterns):
        return "interview"


    # -----------------------------
    # 5️⃣ ONLINE ASSESSMENT
    # -----------------------------

    oa_patterns = [
        r"online assessment",
        r"coding challenge",
        r"coding test",
        r"hackerrank",
        r"codesignal",
        r"assessment link",
        r"complete.*assessment",
        r"technical assessment"
    ]

    if any(re.search(p, text) for p in oa_patterns):
        return "oa"


    # -----------------------------
    # 6️⃣ APPLICATION CONFIRMATION
    # -----------------------------

    applied_patterns = [
        r"application received",
        r"thanks for applying",
        r"thank you for applying",
        r"application submitted",
        r"we have received your application",
        r"your application is under review"
    ]

    if any(re.search(p, text) for p in applied_patterns):
        return "applied"


    # -----------------------------
    # 7️⃣ DEFAULT
    # -----------------------------

    return None