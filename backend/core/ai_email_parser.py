import os
import json
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def parse_email_with_ai(subject, sender, body):

    prompt = f"""
Extract internship update info from this email.

Return ONLY JSON:

{{
"company":"",
"role":"",
"stage":""
}}

Stage must be one of:
applied
oa
interview
offer
rejection
unknown

Subject: {subject}
Sender: {sender}
Body: {body}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        text = response.text.strip()
        text = text.replace("```json","").replace("```","")

        return json.loads(text)

    except Exception as e:

        print("AI parser failed:", e)

        return {
            "company": "Unknown",
            "role": "Intern",
            "stage": "unknown"
        }