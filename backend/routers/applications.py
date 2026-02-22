from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.application import Application
from models.user import User
from schemas.application import ApplicationCreate, ApplicationUpdate
from core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

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

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.get("/")
def get_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Application).filter(
        Application.user_id == current_user.id
    ).all()

@router.post("/")
def create_application(
    app: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_app = Application(
        company=app.company,
        role=app.role,
        status=app.status,
        user_id=current_user.id
    )

    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return new_app

@router.patch("/{id}")
def update_application(
    id: int,
    app: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_app = db.query(Application).filter(
        Application.id == id,
        Application.user_id == current_user.id
    ).first()

    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")

    db_app.status = app.status
    db.commit()

    return db_app

@router.delete("/{id}")
def delete_application(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_app = db.query(Application).filter(
        Application.id == id,
        Application.user_id == current_user.id
    ).first()

    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(db_app)
    db.commit()

    return {"message": "Deleted successfully"}