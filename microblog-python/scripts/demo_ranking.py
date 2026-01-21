#!/usr/bin/env python3
"""
Demo script to showcase the 'For You' ranking algorithm with seeded data.

This script demonstrates how the ranking algorithm works by:
1. Logging in as a seeded user
2. Fetching their personalized feed
3. Showing the scores and reasoning for each post

Usage:
    python scripts/demo_ranking.py [username]

Example:
    python scripts/demo_ranking.py techguru
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.db.user import User
from app.services.ranking import RankingService


async def demo_ranking(username: str = "techguru"):
    """
    Demonstrate the ranking algorithm for a specific user.

    Args:
        username: Username to demo for (default: techguru)
    """
    print(f"🎯 For You Feed Demo - User: @{username}")
    print("=" * 80)

    async with AsyncSessionLocal() as db:
        # Get the user
        result = await db.execute(
            select(User).where(User.username == username)
        )
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ User '{username}' not found!")
            print("\n💡 Hint: Run `python scripts/seed_database.py` first")
            print("Available users: techguru, designwiz, datascience_pro, etc.")
            return

        # Ensure relationships are loaded
        await db.refresh(user, ["following"])

        print(f"\n👤 User Profile:")
        print(f"  Display Name: {user.display_name}")
        print(f"  Bio: {user.bio}")
        print(f"  Following: {len(user.following)} users")

        if user.following:
            print(f"  Following: {', '.join(u.username for u in user.following[:5])}")
            if len(user.following) > 5:
                print(f"             ... and {len(user.following) - 5} more")

        print("\n" + "=" * 80)
        print("📊 Fetching 'For You' Feed...")
        print("=" * 80)

        # Get ranked feed
        scored_posts, total = await RankingService.get_for_you_feed(
            db, user, limit=10
        )

        print(f"\nFound {total} posts, showing top 10:\n")

        for i, (post, score) in enumerate(scored_posts, 1):
            # Calculate individual scores for display
            recency = RankingService.calculate_recency_score(post)
            social = RankingService.calculate_social_score(post, user)
            quality = RankingService.calculate_content_quality_score(post)

            # Determine relationship
            is_following = any(
                followed.id == post.author_id for followed in user.following
            )
            relationship = "✓ Following" if is_following else "○ Not following"

            print(f"#{i} | Score: {score:.3f} | @{post.author.username} | {relationship}")
            print(f"    Content: {post.content[:70]}...")
            print(f"    Breakdown: Recency={recency:.2f} | Social={social:.2f} | Quality={quality:.2f}")
            print()

        print("=" * 80)
        print("📈 Algorithm Explanation")
        print("=" * 80)
        print("""
The 'urgency_score' is calculated as:

    urgency_score = (recency × 0.5) + (social × 0.3) + (quality × 0.2)

Where:
- Recency (0-1): How recent is the post?
  • Last hour: 1.0
  • Last day: 0.7-1.0 (linear decay)
  • Last week: 0.3-0.7 (linear decay)
  • Older: <0.3 (exponential decay)

- Social (0-1): Your relationship with the author
  • Mutual follow: 1.0
  • You follow them: 0.8
  • You don't follow: 0.2

- Quality (0-1): Content characteristics
  • Ideal length (100-200 chars): 1.0
  • Too short (<50 chars): 0.5-0.7
  • Very long (>200 chars): 0.9-1.0
  • Contains emojis: +0.1 bonus
        """)

        print("=" * 80)
        print("💡 Insights from This Feed")
        print("=" * 80)

        # Analyze the feed
        following_posts = sum(
            1
            for post, _ in scored_posts
            if any(followed.id == post.author_id for followed in user.following)
        )

        print(f"• {following_posts}/{len(scored_posts)} posts are from users you follow")
        print(f"• Avg score: {sum(s for _, s in scored_posts) / len(scored_posts):.3f}")

        top_score = scored_posts[0][1] if scored_posts else 0
        bottom_score = scored_posts[-1][1] if scored_posts else 0
        print(f"• Score range: {bottom_score:.3f} - {top_score:.3f}")

        print("\n" + "=" * 80)
        print("🔬 Try These Experiments")
        print("=" * 80)
        print("""
1. Compare with Global Feed:
   - Global feed is purely chronological
   - 'For You' feed is personalized

2. Log in as Different Users:
   python scripts/demo_ranking.py designwiz
   python scripts/demo_ranking.py startup_founder

3. Test Timestamp Distribution:
   - Notice how recent posts score higher
   - But social signals can boost older posts from friends

4. Modify Weights:
   Edit RankingService.calculate_urgency_score() to change:
   - Recency weight (default: 0.5)
   - Social weight (default: 0.3)
   - Quality weight (default: 0.2)
        """)


if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else "techguru"
    asyncio.run(demo_ranking(username))
