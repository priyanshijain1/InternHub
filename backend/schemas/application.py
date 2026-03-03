from pydantic import BaseModel
from typing import Optional

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str
    stipend: Optional[str] = None
    location: Optional[str] = None
    via: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    status: str
    stipend: Optional[str]
    location: Optional[str]
    via: Optional[str]
    notes: Optional[str]
    date: Optional[str]

    class Config:
        from_attributes = True