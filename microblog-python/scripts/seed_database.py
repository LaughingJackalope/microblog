#!/usr/bin/env python3
"""
Synthetic Intelligence Seeding (SIS) Utility

Populates the PostgreSQL database with a rich, interconnected graph of users
and posts to demonstrate the "For You Page" ranking algorithm.

Features:
- 10 diverse user profiles with realistic data
- Following graph to test social feed logic
- 50+ posts with varied timestamps (recency testing)
- Realistic content using Faker
- Idempotent execution (safe to run multiple times)
- Password hashing compatible with app authentication

Usage:
    python scripts/seed_database.py
"""

import asyncio
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from faker import Faker
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, engine
from app.db.base import Base
from app.db.post import Post
from app.db.user import User
from app.security import get_password_hash

# Initialize Faker for realistic data generation
fake = Faker()
Faker.seed(42)  # For reproducibility


class SeedConfig:
    """Configuration for seeding parameters."""

    NUM_USERS = 10
    NUM_POSTS = 50
    DEFAULT_PASSWORD = "password123"  # All seeded users use this password
    MIN_POST_LENGTH = 10
    MAX_POST_LENGTH = 280


class UserProfile:
    """User profile template for seeding."""

    def __init__(self, username: str, display_name: str, bio: str, avatar_emoji: str):
        self.username = username
        self.display_name = display_name
        self.bio = bio
        self.avatar_emoji = avatar_emoji


# Diverse user profiles for realistic social graph
USER_PROFILES = [
    UserProfile(
        username="techguru",
        display_name="Tech Guru",
        bio="Senior Software Engineer 🚀 | Building the future with Python & TypeScript",
        avatar_emoji="👨‍💻",
    ),
    UserProfile(
        username="designwiz",
        display_name="Design Wizard",
        bio="UX/UI Designer | Making the web beautiful one pixel at a time ✨",
        avatar_emoji="🎨",
    ),
    UserProfile(
        username="datascience_pro",
        display_name="Data Science Pro",
        bio="ML Engineer | Turning data into insights 📊 | Python enthusiast",
        avatar_emoji="📈",
    ),
    UserProfile(
        username="startup_founder",
        display_name="Sarah Chen",
        bio="Building @NextGenAI | Serial entrepreneur | Angel investor 💡",
        avatar_emoji="🚀",
    ),
    UserProfile(
        username="devops_ninja",
        display_name="DevOps Ninja",
        bio="Infrastructure & Cloud ☁️ | Kubernetes | Terraform | Making deployments smooth",
        avatar_emoji="🥷",
    ),
    UserProfile(
        username="product_pm",
        display_name="Alex Rivera",
        bio="Product Manager @ TechCorp | User-focused | Bridging tech & business",
        avatar_emoji="📱",
    ),
    UserProfile(
        username="frontend_dev",
        display_name="Emma Watson",
        bio="Frontend Developer | React & Next.js | CSS magician 🪄",
        avatar_emoji="💅",
    ),
    UserProfile(
        username="backend_expert",
        display_name="Backend Expert",
        bio="Backend Developer | FastAPI & Django | Database optimization nerd",
        avatar_emoji="⚙️",
    ),
    UserProfile(
        username="security_specialist",
        display_name="Security Specialist",
        bio="Cybersecurity Expert 🔐 | Ethical hacker | Keeping systems safe",
        avatar_emoji="🛡️",
    ),
    UserProfile(
        username="indie_hacker",
        display_name="Indie Hacker",
        bio="Building in public 🛠️ | Bootstrapped 3 SaaS products | Sharing the journey",
        avatar_emoji="🏗️",
    ),
]


async def get_or_create_user(
    db: AsyncSession, profile: UserProfile, password_hash: str
) -> User:
    """
    Get existing user by username or create new one (idempotent).

    Args:
        db: Database session
        profile: User profile data
        password_hash: Pre-hashed password

    Returns:
        User object (existing or newly created)
    """
    result = await db.execute(select(User).where(User.username == profile.username))
    user = result.scalar_one_or_none()

    if user:
        print(f"  ✓ User '{profile.username}' already exists")
        return user

    user = User(
        id=f"user_{uuid4()}",
        username=profile.username,
        email=f"{profile.username}@microblog.dev",
        password_hash=password_hash,
        display_name=profile.display_name,
        bio=profile.bio,
    )

    db.add(user)
    await db.flush()
    print(f"  + Created user '{profile.username}'")
    return user


def generate_microblog_content() -> str:
    """
    Generate realistic microblog content with varying lengths and characteristics.

    Returns:
        Post content string between 10-280 characters with UTF-8 variety
    """
    content_types = [
        # Short thoughts
        lambda: fake.sentence(nb_words=6)[:-1],  # Remove period
        # Announcements
        lambda: f"🎉 {fake.sentence(nb_words=10)}",
        # Questions
        lambda: f"🤔 {fake.sentence(nb_words=8)}?",
        # Code-related
        lambda: f"Just shipped {fake.word()} v{fake.random_int(1, 9)}.{fake.random_int(0, 9)}! {fake.sentence()}",
        # Long-form thoughts
        lambda: f"{fake.paragraph(nb_sentences=2)[:270]}...",
        # Emojis and special chars
        lambda: f"{fake.emoji()} {fake.sentence()} {fake.emoji()}",
        # Technical content
        lambda: f"TIL: {fake.sentence(nb_words=15)} #coding #tech",
        # Links/mentions
        lambda: f"{fake.sentence()} Check out @{fake.user_name()} 🔗",
        # Status updates
        lambda: f"Working on {fake.catch_phrase().lower()} 💻 {fake.sentence(nb_words=8)}",
        # Unicode variety
        lambda: f"{fake.sentence()} 日本語 {fake.emoji()} Ñoño",
    ]

    # Generate content and ensure it meets length constraints
    content = fake.random_element(content_types)()

    # Ensure minimum length
    while len(content) < SeedConfig.MIN_POST_LENGTH:
        content += f" {fake.word()}"

    # Ensure maximum length
    if len(content) > SeedConfig.MAX_POST_LENGTH:
        content = content[: SeedConfig.MAX_POST_LENGTH - 3] + "..."

    return content


def generate_timestamp_distribution() -> datetime:
    """
    Generate varied timestamps to test recency factor in ranking algorithm.

    Distribution:
    - 30% very recent (0-30 minutes ago)
    - 25% recent (30 min - 4 hours ago)
    - 20% today (4-24 hours ago)
    - 15% yesterday (1-2 days ago)
    - 10% old (2-7 days ago)

    Returns:
        Timezone-aware datetime
    """
    now = datetime.now(timezone.utc)
    rand = fake.random_int(1, 100)

    if rand <= 30:  # Very recent
        minutes_ago = fake.random_int(0, 30)
        return now - timedelta(minutes=minutes_ago)
    elif rand <= 55:  # Recent
        minutes_ago = fake.random_int(30, 240)
        return now - timedelta(minutes=minutes_ago)
    elif rand <= 75:  # Today
        hours_ago = fake.random_int(4, 24)
        return now - timedelta(hours=hours_ago)
    elif rand <= 90:  # Yesterday
        days_ago = fake.random_number(digits=1) / 10 + 1  # 1.0-1.9 days
        return now - timedelta(days=days_ago)
    else:  # Old
        days_ago = fake.random_int(2, 7)
        return now - timedelta(days=days_ago)


async def create_following_graph(db: AsyncSession, users: list[User]) -> None:
    """
    Create a realistic following graph to test social feed logic.

    Strategy:
    - Some users are "influencers" (followed by many)
    - Some users are "active followers" (follow many)
    - Some users have mutual follows
    - Ensures graph connectivity for feed testing

    Args:
        db: Database session
        users: List of all users
    """
    print("\n📊 Creating following graph...")

    # Define influencer indices (users 0, 3, 9)
    influencer_indices = [0, 3, 9]

    # Define active follower indices (users 2, 5, 6)
    active_follower_indices = [2, 5, 6]

    for i, follower in enumerate(users):
        # Refresh to ensure relationships are loaded
        await db.refresh(follower, ["following"])

        # Skip if already has following relationships (idempotent)
        if len(follower.following) > 0:
            print(f"  ✓ User '{follower.username}' already has follows")
            continue

        follows = []

        # Everyone follows the influencers
        if i not in influencer_indices:
            for inf_idx in influencer_indices:
                if inf_idx != i:
                    follows.append(users[inf_idx])

        # Active followers follow 5-7 random users
        if i in active_follower_indices:
            potential_follows = [u for j, u in enumerate(users) if j != i]
            additional = fake.random_sample(potential_follows, length=fake.random_int(3, 5))
            follows.extend([u for u in additional if u not in follows])

        # Random mutual follows (30% chance)
        if fake.random_int(1, 100) <= 30:
            potential = [u for j, u in enumerate(users) if j != i and u not in follows]
            if potential:
                follows.append(fake.random_element(potential))

        # Add follows to user
        for followed_user in follows:
            if followed_user not in follower.following:
                follower.following.append(followed_user)

        await db.flush()
        print(f"  + User '{follower.username}' now follows {len(follows)} users")


async def create_posts(db: AsyncSession, users: list[User]) -> list[Post]:
    """
    Create realistic posts with varied content and timestamps.

    Args:
        db: Database session
        users: List of users to create posts for

    Returns:
        List of created posts
    """
    print(f"\n📝 Creating {SeedConfig.NUM_POSTS} posts...")

    posts = []

    # Track existing posts to avoid duplicates (idempotent check)
    existing_count = await db.scalar(select(func.count()).select_from(Post))

    if existing_count >= SeedConfig.NUM_POSTS:
        print(f"  ✓ Database already has {existing_count} posts, skipping post creation")
        result = await db.execute(select(Post).limit(SeedConfig.NUM_POSTS))
        return list(result.scalars().all())

    posts_to_create = SeedConfig.NUM_POSTS - existing_count

    for i in range(posts_to_create):
        # Weighted random user selection (influencers post more)
        # Influencers (indices 0, 3, 9) post 3x more
        weights = [3 if j in [0, 3, 9] else 1 for j in range(len(users))]
        author_index = fake.random.choices(range(len(users)), weights=weights, k=1)[0]
        author = users[author_index]

        content = generate_microblog_content()
        created_at = generate_timestamp_distribution()

        post = Post(
            id=f"post_{uuid4()}",
            content=content,
            author_id=author.id,
        )

        # Manually set created_at for timestamp distribution testing
        # This overrides the server default
        db.add(post)
        await db.flush()

        # Update the created_at after the post is added
        post.created_at = created_at
        await db.flush()

        posts.append(post)

        if (i + 1) % 10 == 0:
            print(f"  + Created {i + 1}/{posts_to_create} posts")

    print(f"  ✓ Finished creating {posts_to_create} new posts")
    return posts


async def seed_database():
    """Main seeding orchestration function."""
    print("🌱 Starting Synthetic Intelligence Seeding (SIS)")
    print("=" * 60)

    # Hash password once for all users (performance optimization)
    password_hash = get_password_hash(SeedConfig.DEFAULT_PASSWORD)
    print(f"\n🔐 Password for all seeded users: '{SeedConfig.DEFAULT_PASSWORD}'")

    async with AsyncSessionLocal() as db:
        try:
            # Step 1: Create users
            print(f"\n👥 Creating {SeedConfig.NUM_USERS} users...")
            users = []
            for profile in USER_PROFILES[: SeedConfig.NUM_USERS]:
                user = await get_or_create_user(db, profile, password_hash)
                users.append(user)

            await db.commit()

            # Step 2: Create following graph
            await create_following_graph(db, users)
            await db.commit()

            # Step 3: Create posts
            posts = await create_posts(db, users)
            await db.commit()

            # Step 4: Summary statistics
            print("\n" + "=" * 60)
            print("✅ Seeding Complete!")
            print("=" * 60)

            total_users = await db.scalar(select(func.count()).select_from(User))
            total_posts = await db.scalar(select(func.count()).select_from(Post))

            print(f"\n📊 Database Statistics:")
            print(f"  • Total Users: {total_users}")
            print(f"  • Total Posts: {total_posts}")

            # Calculate follow statistics
            total_follows = 0
            for user in users:
                await db.refresh(user, ["following"])
                total_follows += len(user.following)

            print(f"  • Total Follows: {total_follows}")
            print(f"  • Avg Follows per User: {total_follows / len(users):.1f}")

            # Post recency distribution
            now = datetime.now(timezone.utc)
            recent = await db.scalar(
                select(func.count())
                .select_from(Post)
                .where(Post.created_at > now - timedelta(hours=1))
            )
            today = await db.scalar(
                select(func.count())
                .select_from(Post)
                .where(Post.created_at > now - timedelta(days=1))
            )

            print(f"\n⏰ Post Recency Distribution:")
            print(f"  • Last hour: {recent}")
            print(f"  • Last 24 hours: {today}")
            print(f"  • Older: {total_posts - today}")

            print("\n💡 Next Steps:")
            print(f"  1. Log in as any user (e.g., '{USER_PROFILES[0].username}')")
            print(f"  2. Password: '{SeedConfig.DEFAULT_PASSWORD}'")
            print("  3. Explore the 'For You' feed to see ranking algorithm in action")
            print("  4. Test Following vs Global feeds")
            print("\n" + "=" * 60)

        except Exception as e:
            print(f"\n❌ Error during seeding: {e}")
            await db.rollback()
            raise
        finally:
            await db.close()


async def cleanup_database():
    """
    Optional: Clean up all seeded data.
    WARNING: This will delete ALL data from the database!
    """
    print("🗑️  Cleaning up database...")

    async with AsyncSessionLocal() as db:
        try:
            await db.execute(Post.__table__.delete())
            await db.execute(User.__table__.delete())
            await db.commit()
            print("✅ Database cleaned!")
        except Exception as e:
            print(f"❌ Error during cleanup: {e}")
            await db.rollback()
            raise
        finally:
            await db.close()


if __name__ == "__main__":
    # Check for cleanup flag
    if len(sys.argv) > 1 and sys.argv[1] == "--cleanup":
        asyncio.run(cleanup_database())
    else:
        asyncio.run(seed_database())
