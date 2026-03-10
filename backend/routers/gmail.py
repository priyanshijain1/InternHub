import os
import secrets
import base64
import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from database import SessionLocal
from models.user import User
from models.application import Application
from models.oauth_state import OAuthState

from core.security import decode_token
from core.encryption import encrypt_token, decrypt_token

from core.email_parser import rule_based_parser
from core.ai_email_parser import parse_email_with_ai


router = APIRouter()
security = HTTPBearer()

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


# ---------------- DB DEPENDENCY ---------------- #

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AUTH ---------------- #

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == payload.get("sub")).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ---------------- EMAIL BODY EXTRACTION ---------------- #

def extract_body(msg):

    payload = msg["payload"]

    if "parts" in payload:

        for part in payload["parts"]:

            if part["mimeType"] == "text/plain":

                data = part["body"].get("data")

                if not data:
                    continue

                return base64.urlsafe_b64decode(data).decode("utf-8")

    body = payload.get("body", {}).get("data")

    if body:
        return base64.urlsafe_b64decode(body).decode("utf-8")

    return ""


# ---------------- EMAIL PARSER ---------------- #

def detect_update(subject, sender, body):

    status = rule_based_parser(subject, body)

    domain = re.findall(r'@([\w\-]+)', sender)
    company = domain[0].capitalize() if domain else "Unknown"

    if status:
        return {
            "company": company,
            "role": "Intern",
            "status": status
        }

    ai_result = parse_email_with_ai(subject, sender, body)

    if ai_result:
        return {
            "company": ai_result.get("company"),
            "role": ai_result.get("role"),
            "status": ai_result.get("stage")
        }

    return None


# ---------------- CONNECT GMAIL ---------------- #

@router.get("/connect")
def connect_gmail(current_user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):

    state = secrets.token_urlsafe(32)

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=SCOPES,
    )

    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        state=state
    )

    db_state = OAuthState(
        user_id=current_user.id,
        state=state,
        code_verifier=flow.code_verifier
    )

    db.add(db_state)
    db.commit()

    return {"auth_url": auth_url}


# ---------------- CALLBACK ---------------- #

@router.get("/callback")
def gmail_callback(code: str, state: str,
                   db: Session = Depends(get_db)):

    db_state = db.query(OAuthState).filter(OAuthState.state == state).first()

    if not db_state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=SCOPES,
    )

    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    flow.code_verifier = db_state.code_verifier

    flow.fetch_token(code=code)

    credentials = flow.credentials

    user = db.query(User).filter(User.id == db_state.user_id).first()

    encrypted_refresh = encrypt_token(credentials.refresh_token)

    user.gmail_connected = True
    user.gmail_refresh_token = encrypted_refresh

    db.delete(db_state)
    db.commit()

    # redirect to frontend dashboard
    return RedirectResponse(
        url="http://localhost:5173?gmail=connected"
    )


# ---------------- DISCONNECT ---------------- #

@router.post("/disconnect")
def disconnect_gmail(current_user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):

    current_user.gmail_connected = False
    current_user.gmail_refresh_token = None
    db.commit()

    return {"message": "Gmail disconnected"}


# ---------------- GMAIL SERVICE ---------------- #

def get_gmail_service(user: User):

    refresh_token = decrypt_token(user.gmail_refresh_token)

    creds = Credentials(
        None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    )

    if creds.expired or not creds.valid:
        creds.refresh(Request())

    return build("gmail", "v1", credentials=creds)


# ---------------- FETCH EMAILS ---------------- #

def fetch_unread_emails(user: User):

    service = get_gmail_service(user)

    results = service.users().messages().list(
        userId="me",
        labelIds=["INBOX"],
        q="newer_than:30d (application OR interview OR assessment OR hackerrank OR codesignal OR recruiter OR hiring)"
    ).execute()

    messages = results.get("messages", [])

    emails = []

    for msg in messages:

        msg_data = service.users().messages().get(
            userId="me",
            id=msg["id"]
        ).execute()

        snippet = msg_data.get("snippet", "")

        headers = msg_data["payload"]["headers"]

        subject = ""
        sender = ""

        for header in headers:

            if header["name"] == "Subject":
                subject = header["value"]

            if header["name"] == "From":
                sender = header["value"]

        body = extract_body(msg_data)

        emails.append({
            "subject": subject,
            "sender": sender,
            "snippet": snippet,
            "body": body
        })

    return emails


# ---------------- SCAN EMAILS ---------------- #

@router.get("/scan")
def scan_emails(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not current_user.gmail_connected:
        raise HTTPException(status_code=400, detail="Gmail not connected")

    emails = fetch_unread_emails(current_user)

    updates = []

    for email in emails:

        subject = email["subject"]
        sender = email["sender"]
        body = email.get("body", "")

        print("\n----- EMAIL -----")
        print("SUBJECT:", subject)
        print("SENDER:", sender)
        print("BODY:", body[:200])
        print("-----------------\n")

        parsed = detect_update(
            subject,
            sender,
            body
        )

        if not parsed:
            continue

        company = parsed["company"]
        status = parsed["status"]

        existing = db.query(Application).filter(
            Application.company == company,
            Application.user_id == current_user.id
        ).first()

        if existing:
            existing.status = status

        else:
            new_app = Application(
                company=company,
                role="Unknown",
                status=status,
                user_id=current_user.id
            )
            db.add(new_app)

        updates.append({
            "company": company,
            "status": status
        })

    db.commit()

    return {
        "emails_scanned": len(emails),
        "updates_detected": updates
    }