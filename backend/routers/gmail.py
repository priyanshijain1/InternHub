import os
from core.email_parser import parse_email
from models.application import Application
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from database import SessionLocal
from models.user import User
from models.oauth_state import OAuthState
from core.security import decode_token
from core.encryption import encrypt_token, decrypt_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

# STEP 1 — Connect Gmail
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

# STEP 2 — Callback
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

    return {"message": "Gmail connected successfully"}

# STEP 3 — Disconnect
@router.post("/disconnect")
def disconnect_gmail(current_user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):

    current_user.gmail_connected = False
    current_user.gmail_refresh_token = None
    db.commit()

    return {"message": "Gmail disconnected"}

# Utility to get Gmail service
def get_gmail_service(user: User):
    refresh_token = decrypt_token(user.gmail_refresh_token)

    creds = Credentials(
        None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    )

    creds.refresh(Request())

    return build("gmail", "v1", credentials=creds)


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

        emails.append({
            "id": msg["id"],
            "subject": subject,
            "sender": sender,
            "snippet": snippet
        })

    return emails


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

        print("\n----- EMAIL -----")
        print("SUBJECT:", email["subject"])
        print("SENDER:", email["sender"])
        print("SNIPPET:", email["snippet"])
        print("-----------------\n")

        parsed = parse_email(
            email["subject"],
            email["snippet"],
            email["sender"]
        )

        company = parsed["company"]
        status = parsed["status"]

        if not company or not status:
            continue

        # check if already exists
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