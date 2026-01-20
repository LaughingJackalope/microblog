"""Authentication Pydantic models."""

from pydantic import BaseModel, Field


class TokenRequest(BaseModel):
    """Schema for login request."""

    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Schema for successful authentication response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Schema for decoded JWT token data."""

    user_id: str
    username: str
