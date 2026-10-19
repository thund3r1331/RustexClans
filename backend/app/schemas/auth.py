from datetime import datetime
from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None
    role: str | None = None


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(default="moderator", pattern="^(admin|moderator)$")


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
