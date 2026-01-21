"""Post business logic service."""

from typing import List, Optional
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.post import Post
from app.db.user import User


class PostService:
    """Service for post-related business logic."""

    @staticmethod
    async def create_post(
        db: AsyncSession,
        content: str,
        author_id: str,
    ) -> Post:
        """Create a new post."""
        post = Post(
            id=f"post_{uuid4()}",
            content=content,
            author_id=author_id,
        )
        db.add(post)
        await db.flush()
        await db.refresh(post, ["author"])
        return post

    @staticmethod
    async def get_post_by_id(
        db: AsyncSession,
        post_id: str,
    ) -> Optional[Post]:
        """Get a post by ID with author loaded."""
        result = await db.execute(
            select(Post).where(Post.id == post_id).options(selectinload(Post.author))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_post(
        db: AsyncSession,
        post: Post,
    ) -> None:
        """Delete a post."""
        await db.delete(post)
        await db.flush()

    @staticmethod
    async def get_user_posts(
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[Post], int]:
        """Get all posts by a specific user with pagination."""
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
            .order_by(Post.created_at.desc(), Post.content.desc())
            .limit(limit)
            .offset(offset)
        )
        posts = posts_result.scalars().all()
        return list(posts), total

    @staticmethod
    async def get_timeline(
        db: AsyncSession,
        user: User,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[Post], int]:
        """Get timeline of posts from users being followed plus own posts."""
        # Ensure user following is loaded to avoid MissingGreenlet
        await db.refresh(user, ["following"])
        following_ids = [followed_user.id for followed_user in user.following]
        following_ids.append(user.id)

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
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(limit)
            .offset(offset)
        )
        posts = posts_result.scalars().all()
        return list(posts), total
