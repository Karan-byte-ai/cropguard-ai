from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Password with minimum 8 characters")
    language: str = Field(default="en", description="Preferred UI language: en, hi, mr")
    region: Optional[str] = Field(default=None, description="State or district name")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    language: str
    region: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    language: str
    region: Optional[str] = None
