from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String)
    role = Column(String)
    status = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))