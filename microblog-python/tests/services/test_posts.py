"""Unit tests for PostService."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.posts import PostService
from app.db.user import User


@pytest.mark.asyncio
async def test_create_post(test_db: AsyncSession, test_user):
    """Test creating a post via service."""
    content = "Hello from service test!"
    author_id = test_user["user"]["id"]
    
    post = await PostService.create_post(test_db, content, author_id)
    
    assert post.content == content
    assert post.author_id == author_id
    assert post.id.startswith("post_")
    # Verify author is loaded
    assert post.author.username == "testuser"


@pytest.mark.asyncio
async def test_get_post_by_id(test_db: AsyncSession, test_user):
    """Test getting a post by ID via service."""
    author_id = test_user["user"]["id"]
    post = await PostService.create_post(test_db, "Some content", author_id)
    
    retrieved_post = await PostService.get_post_by_id(test_db, post.id)
    
    assert retrieved_post is not None
    assert retrieved_post.id == post.id
    assert retrieved_post.content == "Some content"


@pytest.mark.asyncio
async def test_delete_post(test_db: AsyncSession, test_user):
    """Test deleting a post via service."""
    author_id = test_user["user"]["id"]
    post = await PostService.create_post(test_db, "To be deleted", author_id)
    
    await PostService.delete_post(test_db, post)
    
    retrieved_post = await PostService.get_post_by_id(test_db, post.id)
    assert retrieved_post is None


@pytest.mark.asyncio
async def test_get_user_posts(test_db: AsyncSession, test_user):
    """Test getting user posts via service."""
    author_id = test_user["user"]["id"]
    await PostService.create_post(test_db, "Post 1", author_id)
    await PostService.create_post(test_db, "Post 2", author_id)
    
    posts, total = await PostService.get_user_posts(test_db, author_id)
    
    assert total == 2
    assert len(posts) == 2
    # Order should be newest first (Post 2 has higher ID/created_at)
    assert posts[0].content == "Post 2"


@pytest.mark.asyncio
async def test_get_timeline(test_db: AsyncSession, test_user, test_user2):
    """Test getting timeline via service."""
    user1_id = test_user["user"]["id"]
    user2_id = test_user2["user"]["id"]
    
    # User 1 follows User 2 (using direct db access for setup)
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    result = await test_db.execute(
        select(User).where(User.id == user1_id).options(selectinload(User.following))
    )
    user1 = result.scalar_one()
    
    result = await test_db.execute(select(User).where(User.id == user2_id))
    user2 = result.scalar_one()
    
    user1.following.append(user2)
    await test_db.flush()
    
    # Both create a post
    await PostService.create_post(test_db, "User 1 post", user1_id)
    await PostService.create_post(test_db, "User 2 post", user2_id)
    
    posts, total = await PostService.get_timeline(test_db, user1)
    
    assert total == 2
    assert len(posts) == 2
