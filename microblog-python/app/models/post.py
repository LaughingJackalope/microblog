"""Post Pydantic models for API validation and TypeScript generation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PostAuthor


class PostCreate(BaseModel):
    """Schema for creating a new post."""

    content: str = Field(..., min_length=1, max_length=280)


class PostPublic(BaseModel):
    """Public post schema (returned by API)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    content: str
    created_at: datetime
    author: PostAuthor


class PostList(BaseModel):
    """Paginated list of posts."""

    posts: list[PostPublic]
    total: int
    offset: int
    limit: int
