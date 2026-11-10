from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    username: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=4)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
