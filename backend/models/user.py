from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    cgpa = Column(String, nullable=True)
    bio = Column(String, nullable=True)

    roles = Column(String, nullable=True)
    locations = Column(String, nullable=True)
    stipend = Column(String, nullable=True)

    emailNotifs = Column(Boolean, default=True)
    scamAlerts = Column(Boolean, default=True)
    publicProfile = Column(Boolean, default=False)

    resume_filename = Column(String, nullable=True)

    applications = relationship("Application", back_populates="user")