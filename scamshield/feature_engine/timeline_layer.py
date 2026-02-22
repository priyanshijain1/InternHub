import whois
from datetime import datetime
import tldextract

def check_domain_age(url):
    try:
        extracted = tldextract.extract(url)
        domain = f"{extracted.domain}.{extracted.suffix}"

        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date

        if not creation_date:
            return 0.0, "Unknown"

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        # Remove timezone if exists
        if creation_date.tzinfo is not None:
            creation_date = creation_date.replace(tzinfo=None)

        age_days = (datetime.now() - creation_date).days

        # Convert to years, months, days
        years = age_days // 365
        months = (age_days % 365) // 30
        days = (age_days % 365) % 30

        age_string = f"{years} years, {months} months, {days} days"

        # Graded Risk Based on Age
        if age_days < 30:
            risk_score = 0.4
        elif age_days < 90:
            risk_score = 0.2
        elif age_days < 365:
            risk_score = 0.1
        else:
            risk_score = 0.0

        return risk_score, age_string

    except Exception as e:
        print("WHOIS error:", e)
        return 0.0, "Unknown"