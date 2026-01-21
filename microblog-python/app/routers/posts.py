"""Post management and timeline endpoints."""

from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.db.post import Post
from app.db.user import User
from app.dependencies import CurrentUser
from app.models.post import PostCreate, PostList, PostPublic
from app.models.user import PostAuthor, UserPublic
from app.services.posts import PostService
from app.services.users import UserService

router = APIRouter(prefix="/v1/posts", tags=["posts"])


@router.post("", response_model=PostPublic, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PostPublic:
    """Create a new post."""
    post = await PostService.create_post(
        db=db,
        content=post_data.content,
        author_id=current_user.id,
    )

    # Load author counts if needed by schema, but PostAuthor only needs basic info.
    # We should ensure post.author is loaded which PostService.create_post does.
    return PostPublic.model_validate(post)


@router.get("/{post_id}", response_model=PostPublic)
async def get_post(
    post_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PostPublic:
    """Get a specific post by ID."""
    post = await PostService.get_post_by_id(db, post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return PostPublic.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a post (owner only)."""
    post = await PostService.get_post_by_id(db, post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post",
        )

    await PostService.delete_post(db, post)


@router.get("/user/{user_id}", response_model=PostList)
async def get_user_posts(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> PostList:
    """Get all posts by a specific user with pagination."""
    # Check if user exists
    user = await UserService.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    posts, total = await PostService.get_user_posts(db, user_id, limit, offset)

    return PostList(
        posts=[PostPublic.model_validate(post) for post in posts],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("", response_model=PostList)
async def get_timeline(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> PostList:
    """Get timeline of posts from users you follow (plus your own)."""
    posts, total = await PostService.get_timeline(db, current_user, limit, offset)

    return PostList(
        posts=[PostPublic.model_validate(post) for post in posts],
        total=total,
        offset=offset,
        limit=limit,
    )
