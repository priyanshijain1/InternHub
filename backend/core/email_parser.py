import re

# domains that are NOT job related
IGNORE_DOMAINS = [
    "codeforces",
    "github",
    "stackexchange",
    "newsletter",
    "medium",
    "youtube",
    "twitter",
    "discord"
]

STATUS_PATTERNS = {
    "applied": [
        "thank you for applying",
        "application received",
        "we received your application",
        "thanks for applying",
        "your application has been received"
    ],

    "oa": [
        "online assessment",
        "coding challenge",
        "hackerrank",
        "codesignal",
        "codility",
        "assessment",
        "take home assignment"
    ],

    "interview": [
        "interview",
        "schedule your interview",
        "interview round",
        "technical interview",
        "next round interview"
    ],

    "offer": [
        "offer letter",
        "we are pleased to offer",
        "offer of employment",
        "congratulations"
    ],

    "rejected": [
        "regret to inform",
        "unfortunately",
        "not moving forward",
        "not selected"
    ]
}


def detect_status(text):

    text = text.lower()

    for status, keywords in STATUS_PATTERNS.items():
        for word in keywords:
            if word in text:
                return status

    return None


def extract_company_from_sender(sender):

    # Example: Google Careers <careers@google.com>

    email_match = re.search(r"<(.+?)>", sender)

    if email_match:
        sender = email_match.group(1)

    domain_match = re.search(r"@([a-zA-Z0-9.-]+)", sender)

    if not domain_match:
        return None

    domain = domain_match.group(1)

    company = domain.split(".")[0]

    company = company.replace("jobs", "")
    company = company.replace("careers", "")
    company = company.replace("noreply", "")

    # ignore domains like codeforces
    if company.lower() in IGNORE_DOMAINS:
        return None

    return company.capitalize()


def parse_email(subject, snippet, sender):

    text = f"{subject} {snippet}".lower()

    # check if email even looks like a job email
    job_keywords = [
        "application",
        "interview",
        "assessment",
        "hiring",
        "position",
        "recruiter",
        "job"
    ]

    if not any(word in text for word in job_keywords):
        return {
            "company": None,
            "status": None
        }

    status = detect_status(text)

    company = extract_company_from_sender(sender)

    return {
        "company": company,
        "status": status
    }