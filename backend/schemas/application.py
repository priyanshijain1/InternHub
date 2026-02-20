from pydantic import BaseModel

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str

class ApplicationUpdate(BaseModel):
    status: str