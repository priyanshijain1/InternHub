from pydantic import BaseModel
from typing import Optional

class ProfileResponse(BaseModel):
    name: str
    email: str
    college: Optional[str]
    branch: Optional[str]
    cgpa: Optional[str]
    bio: Optional[str]
    roles: Optional[str]
    locations: Optional[str]
    stipend: Optional[str]
    emailNotifs: bool
    scamAlerts: bool
    publicProfile: bool
    resume_filename: Optional[str]

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[str] = None
    bio: Optional[str] = None
    roles: Optional[str] = None
    locations: Optional[str] = None
    stipend: Optional[str] = None


class SettingsUpdate(BaseModel):
    emailNotifs: Optional[bool] = None
    scamAlerts: Optional[bool] = None
    publicProfile: Optional[bool] = None