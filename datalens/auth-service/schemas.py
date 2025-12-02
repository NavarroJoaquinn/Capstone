from pydantic import BaseModel, EmailStr, Field
# schemas.py    
from typing import Optional
from datetime import datetime



class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    company_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    id: str
    email: EmailStr
    company_name: Optional[str] = None 
    role: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
