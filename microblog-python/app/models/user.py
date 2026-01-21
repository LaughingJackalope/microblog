"""User Pydantic models for API validation and TypeScript generation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""

    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration."""

    password: str = Field(..., min_length=8, max_length=100)
    display_name: str | None = Field(None, max_length=100)
    bio: str | None = Field(None, max_length=250)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    model_config = ConfigDict(populate_by_name=True)

    display_name: str | None = Field(None, max_length=100, alias="displayName")
    bio: str | None = Field(None, max_length=250)


class UserPublic(BaseModel):
    """Public user profile (returned by API)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    display_name: str | None
    bio: str | None
    join_date: datetime
    post_count: int = 0
    follower_count: int = 0
    following_count: int = 0


class UserInDB(UserPublic):
    """User model including password hash (internal use only)."""

    password_hash: str


class PostAuthor(BaseModel):
    """Minimal author info for post responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    display_name: str | None
