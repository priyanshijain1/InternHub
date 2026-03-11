import requests
from bs4 import BeautifulSoup
import re


def fetch_website_data(url=None, description=None):

    # -----------------------------------
    # DESCRIPTION ONLY MODE
    # -----------------------------------
    if (url is None or url.strip() == "") and description:

        text = description

        emails = re.findall(
            r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
            text
        )

        raw_phones = re.findall(r'\+?\d[\d\s\-]{8,14}\d', text)

        cleaned_phones = []
        for phone in raw_phones:
            digits_only = re.sub(r'\D', '', phone)
            if 10 <= len(digits_only) <= 13:
                cleaned_phones.append(phone)

        phones = list(set(cleaned_phones))

        return {
            "url": "manual_input",
            "title": "",
            "text": text,
            "meta_descriptions": [],
            "emails": emails,
            "phones": phones,
            "links": [],
            "form_count": 0,
            "script_count": 0
        }


    # -----------------------------------
    # WEBSITE SCRAPING MODE
    # -----------------------------------
    try:

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        html = response.text
        soup = BeautifulSoup(html, "html.parser")

        # ----------------------------
        # Extract visible text
        # ----------------------------
        text = soup.get_text(separator=" ", strip=True)

        # If description also given → combine
        if description:
            text = text + " " + description

        # ----------------------------
        # Extract title
        # ----------------------------
        title = soup.title.string.strip() if soup.title else ""

        # ----------------------------
        # Extract meta descriptions
        # ----------------------------
        meta_descriptions = []
        for meta in soup.find_all("meta"):
            if meta.get("name") == "description" or meta.get("property") == "og:description":
                if meta.get("content"):
                    meta_descriptions.append(meta.get("content"))

        # ----------------------------
        # Extract Emails
        # ----------------------------
        emails = re.findall(
            r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
            html
        )
        emails = list(set(emails))

        # ----------------------------
        # Extract Valid Phone Numbers
        # ----------------------------
        raw_phones = re.findall(r'\+?\d[\d\s\-]{8,14}\d', html)

        cleaned_phones = []

        for phone in raw_phones:
            phone = phone.strip()

            digits_only = re.sub(r'\D', '', phone)

            if 10 <= len(digits_only) <= 13:
                cleaned_phones.append(phone)

        phones = list(set(cleaned_phones))

        # ----------------------------
        # Extract Forms
        # ----------------------------
        forms = soup.find_all("form")
        form_count = len(forms)

        # ----------------------------
        # Extract Scripts
        # ----------------------------
        scripts = soup.find_all("script")
        script_count = len(scripts)

        # ----------------------------
        # Extract Links
        # ----------------------------
        links = [a.get("href") for a in soup.find_all("a", href=True)]

        return {
            "url": url,
            "title": title,
            "text": text,
            "meta_descriptions": meta_descriptions,
            "emails": emails,
            "phones": phones,
            "links": links,
            "form_count": form_count,
            "script_count": script_count
        }

    except Exception as e:
        print("Error fetching website:", e)
        return None