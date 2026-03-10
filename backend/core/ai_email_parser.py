import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-pro")


def parse_email_with_ai(subject, sender, body):

    prompt = f"""
You are an AI that extracts internship updates from emails.

Return JSON only.

Fields:
company
role
stage (applied, oa, interview, rejection, offer, unknown)

Email Subject:
{subject}

Sender:
{sender}

Email Body:
{body}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    try:
        import json
        return json.loads(text)
    except:
        return None