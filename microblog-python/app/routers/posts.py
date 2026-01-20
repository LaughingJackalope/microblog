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
from app.models.user import PostAuthor

router = APIRouter(prefix="/v1/posts", tags=["posts"])


@router.post("", response_model=PostPublic, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PostPublic:
    """Create a new post."""
    post = Post(
        id=f"post_{uuid4()}",
        content=post_data.content,
        author_id=current_user.id,
    )

    db.add(post)
    await db.flush()
    await db.refresh(post, ["author"])

    return PostPublic(
        id=post.id,
        content=post.content,
        created_at=post.created_at,
        author=PostAuthor.model_validate(post.author),
    )


@router.get("/{post_id}", response_model=PostPublic)
async def get_post(
    post_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PostPublic:
    """Get a specific post by ID."""
    result = await db.execute(
        select(Post).where(Post.id == post_id).options(selectinload(Post.author))
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return PostPublic(
        id=post.id,
        content=post.content,
        created_at=post.created_at,
        author=PostAuthor.model_validate(post.author),
    )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a post (owner only)."""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

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

    await db.delete(post)
    await db.flush()


@router.get("/user/{user_id}", response_model=PostList)
async def get_user_posts(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> PostList:
    """Get all posts by a specific user with pagination."""
    # Check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(Post).where(Post.author_id == user_id)
    )
    total = count_result.scalar_one()

    # Get posts
    posts_result = await db.execute(
        select(Post)
        .where(Post.author_id == user_id)
        .options(selectinload(Post.author))
        .order_by(Post.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    posts = posts_result.scalars().all()

    return PostList(
        posts=[
            PostPublic(
                id=post.id,
                content=post.content,
                created_at=post.created_at,
                author=PostAuthor.model_validate(post.author),
            )
            for post in posts
        ],
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
    # Get IDs of users being followed (plus self)
    following_ids = [user.id for user in current_user.following]
    following_ids.append(current_user.id)

    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(Post).where(Post.author_id.in_(following_ids))
    )
    total = count_result.scalar_one()

    # Get posts
    posts_result = await db.execute(
        select(Post)
        .where(Post.author_id.in_(following_ids))
        .options(selectinload(Post.author))
        .order_by(Post.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    posts = posts_result.scalars().all()

    return PostList(
        posts=[
            PostPublic(
                id=post.id,
                content=post.content,
                created_at=post.created_at,
                author=PostAuthor.model_validate(post.author),
            )
            for post in posts
        ],
        total=total,
        offset=offset,
        limit=limit,
    )
