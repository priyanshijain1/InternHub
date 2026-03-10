from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class OAuthState(Base):
    __tablename__ = "oauth_states"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    state = Column(String, unique=True)
    code_verifier = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)