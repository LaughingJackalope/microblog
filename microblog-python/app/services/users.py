"""User business logic service."""

from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.user import User, followers
from app.db.post import Post


class UserService:
    """Service for user-related business logic."""

    @staticmethod
    async def get_user_by_id(
        db: AsyncSession,
        user_id: str,
    ) -> Optional[User]:
        """Get a user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_with_counts(
        db: AsyncSession,
        user_id: str,
    ) -> Optional[User]:
        """Get a user by ID and attach counts."""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None

        # Manually fetch counts to avoid lazy-loading issues in Pydantic
        post_count_result = await db.execute(
            select(func.count(Post.id)).where(Post.author_id == user_id)
        )
        user.post_count = post_count_result.scalar_one()

        follower_count_result = await db.execute(
            select(func.count(followers.c.follower_id)).where(followers.c.followed_id == user_id)
        )
        user.follower_count = follower_count_result.scalar_one()

        following_count_result = await db.execute(
            select(func.count(followers.c.followed_id)).where(followers.c.follower_id == user_id)
        )
        user.following_count = following_count_result.scalar_one()

        return user

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user: User,
        display_name: Optional[str] = None,
        bio: Optional[str] = None,
    ) -> User:
        """Update a user's profile."""
        if display_name is not None:
            user.display_name = display_name
        if bio is not None:
            user.bio = bio

        # Explicitly flush to ensure changes are sent to DB
        await db.flush()
        # Refresh to sync with DB state
        await db.refresh(user)
        return user

    @staticmethod
    async def follow_user(
        db: AsyncSession,
        follower: User,
        target_user: User,
    ) -> None:
        """Follow another user."""
        await db.refresh(follower, ["following"])
        if target_user not in follower.following:
            follower.following.append(target_user)
            await db.flush()

    @staticmethod
    async def unfollow_user(
        db: AsyncSession,
        follower: User,
        target_user: User,
    ) -> None:
        """Unfollow a user."""
        await db.refresh(follower, ["following"])
        if target_user in follower.following:
            follower.following.remove(target_user)
            await db.flush()
