import os
import sys
import json
import subprocess
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Absolute path to the scamshield directory
SCAMSHIELD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "scamshield")
)


class AnalyzeRequest(BaseModel):
    url: Optional[str] = ""
    jd: Optional[str] = None
    recruiter_email: Optional[str] = None


def _build_flags(features: dict) -> list:
    flags = []

    if features.get("payment_flag", 0) >= 1:
        flags.append({
            "t": "danger", "icon": "💸",
            "label": "Upfront fee detected",
            "detail": "Legitimate internships never ask for registration or processing fees."
        })

    domain_risk = features.get("domain_risk", 0)
    if domain_risk > 0.6:
        flags.append({
            "t": "danger", "icon": "🌐",
            "label": "High-risk domain",
            "detail": "The listing's domain is newly registered or appears in risk databases."
        })
    elif domain_risk > 0.3:
        flags.append({
            "t": "warning", "icon": "🌐",
            "label": "Unverified domain",
            "detail": "Domain could not be fully verified as a legitimate company."
        })

    if features.get("complaint_risk", 0) > 0.5:
        flags.append({
            "t": "danger", "icon": "🚨",
            "label": "Complaints found",
            "detail": "This URL or contact appears in scam complaint databases."
        })

    if features.get("email_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "📧",
            "label": "Free email domain used",
            "detail": "Recruiter uses Gmail/Yahoo instead of an official company email domain."
        })

    if features.get("nlp_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "⚡",
            "label": "Urgency language detected",
            "detail": "Listing uses high-pressure phrases designed to rush decision-making."
        })

    if features.get("ssl_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "🔒",
            "label": "SSL certificate issues",
            "detail": "The website does not have a valid SSL certificate."
        })

    if features.get("recruiter_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "👤",
            "label": "Recruiter profile suspicious",
            "detail": "Recruiter contact details could not be verified against known databases."
        })

    if features.get("company_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "🏢",
            "label": "Company not verified",
            "detail": "Could not confirm this company's legitimacy through public records."
        })

    if features.get("interview_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "📋",
            "label": "Interview process anomalies",
            "detail": "Unusual interview patterns detected (e.g. WhatsApp-only contact, instant offer)."
        })

    if features.get("linguistic_risk", 0) > 0.6:
        flags.append({
            "t": "danger", "icon": "🗣️",
            "label": "Linguistic manipulation",
            "detail": "Text shows signs of psychological manipulation tactics."
        })

    if features.get("similarity_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "📄",
            "label": "Matches known scam patterns",
            "detail": "Content is highly similar to previously reported fraudulent listings."
        })

    if features.get("geo_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "📍",
            "label": "Geographic risk detected",
            "detail": "Company location is associated with high-fraud regions."
        })

    if features.get("contact_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "📱",
            "label": "Suspicious contact methods",
            "detail": "Only personal phone numbers or messaging apps are provided for contact."
        })

    if features.get("document_risk", 0) > 0.5:
        flags.append({
            "t": "warning", "icon": "📎",
            "label": "Document scam signals",
            "detail": "Listing requests sensitive personal documents upfront."
        })

    if not flags:
        flags.append({
            "t": "ok", "icon": "✅",
            "label": "No major red flags detected",
            "detail": "This listing passed all automated checks. Still exercise caution when sharing personal details."
        })

    return flags


def _map_response(features: dict, result: dict) -> dict:
    final_score = result.get("final_score", 0)

    # Convert 0-1 risk score to 0-100 trust/safety score (higher = safer)
    score = round((1 - final_score) * 100)

    label = result.get("label", "")
    if final_score >= 0.7:
        verdict = "High Risk"
        badge = "scam"
    elif final_score >= 0.4:
        verdict = "Suspicious"
        badge = "warning"
    else:
        verdict = "Likely Legit"
        badge = "ok"

    return {
        "score": score,
        "verdict": verdict,
        "badge": badge,
        "community_reports": 0,
        "flags": _build_flags(features),
        "raw": {
            "final_score": final_score,
            "ml_score": result.get("ml_score"),
            "rule_score": result.get("rule_score"),
        }
    }


@router.post("/analyze")
def analyze(req: AnalyzeRequest):
    payload = {
        "url": (req.url or "").strip(),
        "text": (req.jd or "").strip() or None,
    }

    try:
        proc = subprocess.run(
            ["python3", "run_api.py"],
            cwd=SCAMSHIELD_DIR,
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            timeout=90,
        )
    except subprocess.TimeoutExpired:
        return {"error": "Analysis timed out. The URL may be unreachable."}
    except Exception as e:
        return {"error": f"Failed to run ScamShield: {e}"}

    stdout = proc.stdout.strip()
    if not stdout:
        stderr = proc.stderr.strip()
        return {"error": f"ScamShield returned no output. stderr: {stderr[:300]}"}

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return {"error": f"ScamShield output was not valid JSON: {stdout[:300]}"}

    if "error" in data:
        return {"error": data["error"]}

    return _map_response(data["features"], data["result"])

