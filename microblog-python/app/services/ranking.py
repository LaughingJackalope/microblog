"""
Post ranking service for 'For You' feed algorithm.

This demonstrates how to use the seeded data to build a content ranking system.
The algorithm considers multiple signals to create a personalized feed.
"""

from datetime import datetime, timezone
from typing import List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.post import Post
from app.db.user import User


class RankingService:
    """Service for ranking posts in the 'For You' feed."""

    @staticmethod
    def calculate_recency_score(post: Post) -> float:
        """
        Calculate recency score (0-1, higher is more recent).

        Algorithm:
        - Posts in the last hour: 1.0
        - Posts in the last day: 0.7
        - Posts in the last week: 0.3
        - Older posts: exponential decay
        """
        now = datetime.now(timezone.utc)
        age_seconds = (now - post.created_at).total_seconds()

        # Time thresholds
        HOUR = 3600
        DAY = 86400
        WEEK = 604800

        if age_seconds < HOUR:
            return 1.0
        elif age_seconds < DAY:
            # Linear decay from 1.0 to 0.7 over 24 hours
            return 1.0 - (age_seconds / DAY) * 0.3
        elif age_seconds < WEEK:
            # Linear decay from 0.7 to 0.3 over a week
            return 0.7 - ((age_seconds - DAY) / (WEEK - DAY)) * 0.4
        else:
            # Exponential decay after a week
            weeks_old = age_seconds / WEEK
            return max(0.1, 0.3 * (0.5 ** (weeks_old - 1)))

    @staticmethod
    def calculate_social_score(post: Post, user: User) -> float:
        """
        Calculate social relevance score (0-1).

        Algorithm:
        - Post from followed user: 0.8
        - Post from user you don't follow: 0.2
        - Bonus for mutual follows: +0.2
        """
        # Check if user follows the post author
        is_following = any(
            followed.id == post.author_id for followed in user.following
        )

        if is_following:
            # Check for mutual follow
            is_mutual = any(
                follower.id == user.id for follower in post.author.followers
            )
            return 1.0 if is_mutual else 0.8

        return 0.2

    @staticmethod
    def calculate_content_quality_score(post: Post) -> float:
        """
        Calculate content quality score (0-1) based on post characteristics.

        Algorithm:
        - Ideal length (100-200 chars): 1.0
        - Too short (<50 chars): penalized
        - Near max length: bonus (more effort)
        - Contains emojis: slight bonus
        """
        content_length = len(post.content)

        # Base score from length
        if 100 <= content_length <= 200:
            length_score = 1.0
        elif content_length < 50:
            length_score = 0.5 + (content_length / 100)
        elif content_length > 200:
            # Bonus for long, thoughtful posts
            length_score = min(1.0, 0.9 + (content_length - 200) / 800)
        else:
            # Between 50-100
            length_score = 0.7 + (content_length - 50) / 167

        # Emoji bonus (simple heuristic: contains common emoji ranges)
        has_emoji = any(
            ord(char) > 127 for char in post.content
        )  # Simple Unicode check
        emoji_bonus = 0.1 if has_emoji else 0.0

        return min(1.0, length_score + emoji_bonus)

    @classmethod
    def calculate_urgency_score(
        cls, post: Post, user: User, weights: dict | None = None
    ) -> float:
        """
        Calculate overall urgency/ranking score for a post.

        Default weights:
        - Recency: 50%
        - Social: 30%
        - Quality: 20%

        Returns:
            Score between 0-1 (higher = more important)
        """
        if weights is None:
            weights = {"recency": 0.5, "social": 0.3, "quality": 0.2}

        recency_score = cls.calculate_recency_score(post)
        social_score = cls.calculate_social_score(post, user)
        quality_score = cls.calculate_content_quality_score(post)

        urgency_score = (
            recency_score * weights["recency"]
            + social_score * weights["social"]
            + quality_score * weights["quality"]
        )

        return urgency_score

    @staticmethod
    async def get_for_you_feed(
        db: AsyncSession,
        user: User,
        limit: int = 20,
        offset: int = 0,
        min_score: float = 0.0,
    ) -> tuple[List[tuple[Post, float]], int]:
        """
        Get ranked 'For You' feed with urgency scores.

        This is a demonstration of how to use the ranking algorithm.
        In production, you might:
        1. Pre-compute scores in background jobs
        2. Cache results in Redis
        3. Use more sophisticated ML models

        Args:
            db: Database session
            user: Current user
            limit: Max posts to return
            offset: Pagination offset
            min_score: Minimum urgency score threshold

        Returns:
            Tuple of (list of (post, score) pairs, total count)
        """
        # Ensure user relationships are loaded
        await db.refresh(user, ["following"])

        # Get all posts (in a real app, you'd add time bounds)
        posts_result = await db.execute(
            select(Post)
            .options(selectinload(Post.author).selectinload(User.followers))
            .order_by(Post.created_at.desc())
            .limit(1000)  # Reasonable upper bound
        )
        all_posts = posts_result.scalars().all()

        # Calculate scores for all posts
        scored_posts = [
            (post, RankingService.calculate_urgency_score(post, user))
            for post in all_posts
        ]

        # Filter by minimum score
        scored_posts = [
            (post, score) for post, score in scored_posts if score >= min_score
        ]

        # Sort by score (descending)
        scored_posts.sort(key=lambda x: x[1], reverse=True)

        total = len(scored_posts)

        # Apply pagination
        paginated = scored_posts[offset : offset + limit]

        return paginated, total

    @staticmethod
    async def get_global_feed(
        db: AsyncSession,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[Post], int]:
        """
        Get global feed (all posts, sorted by recency only).

        Args:
            db: Database session
            limit: Max posts to return
            offset: Pagination offset

        Returns:
            Tuple of (posts list, total count)
        """
        # Get total count
        count_result = await db.execute(select(func.count()).select_from(Post))
        total = count_result.scalar_one()

        # Get posts
        posts_result = await db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(limit)
            .offset(offset)
        )
        posts = posts_result.scalars().all()

        return list(posts), total
