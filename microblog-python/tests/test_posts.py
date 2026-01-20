"""Test post endpoints and business logic."""

import pytest
from httpx import AsyncClient


class TestCreatePost:
    """Test post creation."""

    @pytest.mark.asyncio
    async def test_create_post_success(self, client: AsyncClient, test_user):
        """Authenticated user can create a post."""
        response = await client.post(
            "/v1/posts",
            json={"content": "This is my first post!"},
            headers=test_user["headers"],
        )
        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "This is my first post!"
        assert data["id"].startswith("post_")
        assert data["author"]["username"] == "testuser"

    @pytest.mark.asyncio
    async def test_create_post_unauthenticated(self, client: AsyncClient):
        """Cannot create post without authentication."""
        response = await client.post(
            "/v1/posts",
            json={"content": "This should fail"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_post_empty_content(self, client: AsyncClient, test_user):
        """Cannot create post with empty content."""
        response = await client.post(
            "/v1/posts",
            json={"content": ""},
            headers=test_user["headers"],
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_post_too_long(self, client: AsyncClient, test_user):
        """Cannot create post over 280 characters."""
        response = await client.post(
            "/v1/posts",
            json={"content": "a" * 281},
            headers=test_user["headers"],
        )
        assert response.status_code == 422


class TestGetPost:
    """Test retrieving a single post."""

    @pytest.mark.asyncio
    async def test_get_post_success(self, client: AsyncClient, test_user):
        """Can retrieve a post by ID."""
        # Create a post
        create_response = await client.post(
            "/v1/posts",
            json={"content": "Test post"},
            headers=test_user["headers"],
        )
        post_id = create_response.json()["id"]

        # Get the post
        response = await client.get(f"/v1/posts/{post_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == post_id
        assert data["content"] == "Test post"

    @pytest.mark.asyncio
    async def test_get_nonexistent_post(self, client: AsyncClient):
        """Getting nonexistent post returns 404."""
        response = await client.get("/v1/posts/post_nonexistent")
        assert response.status_code == 404


class TestDeletePost:
    """Test post deletion."""

    @pytest.mark.asyncio
    async def test_delete_own_post(self, client: AsyncClient, test_user):
        """User can delete their own post."""
        # Create a post
        create_response = await client.post(
            "/v1/posts",
            json={"content": "To be deleted"},
            headers=test_user["headers"],
        )
        post_id = create_response.json()["id"]

        # Delete it
        response = await client.delete(
            f"/v1/posts/{post_id}",
            headers=test_user["headers"],
        )
        assert response.status_code == 204

        # Verify it's gone
        get_response = await client.get(f"/v1/posts/{post_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_others_post(
        self, client: AsyncClient, test_user, test_user2
    ):
        """User cannot delete another user's post."""
        # User 1 creates a post
        create_response = await client.post(
            "/v1/posts",
            json={"content": "User 1's post"},
            headers=test_user["headers"],
        )
        post_id = create_response.json()["id"]

        # User 2 tries to delete it
        response = await client.delete(
            f"/v1/posts/{post_id}",
            headers=test_user2["headers"],
        )
        assert response.status_code == 403


class TestUserPosts:
    """Test getting posts by user."""

    @pytest.mark.asyncio
    async def test_get_user_posts(self, client: AsyncClient, test_user):
        """Can get all posts by a user."""
        # Create multiple posts
        for i in range(3):
            await client.post(
                "/v1/posts",
                json={"content": f"Post {i}"},
                headers=test_user["headers"],
            )

        # Get user's posts
        response = await client.get(f"/v1/posts/user/{test_user['user']['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["posts"]) == 3
        # Should be in reverse chronological order
        assert data["posts"][0]["content"] == "Post 2"

    @pytest.mark.asyncio
    async def test_get_user_posts_pagination(self, client: AsyncClient, test_user):
        """Pagination works for user posts."""
        # Create 5 posts
        for i in range(5):
            await client.post(
                "/v1/posts",
                json={"content": f"Post {i}"},
                headers=test_user["headers"],
            )

        # Get first 2
        response = await client.get(
            f"/v1/posts/user/{test_user['user']['id']}?limit=2&offset=0"
        )
        data = response.json()
        assert len(data["posts"]) == 2
        assert data["total"] == 5

        # Get next 2
        response = await client.get(
            f"/v1/posts/user/{test_user['user']['id']}?limit=2&offset=2"
        )
        data = response.json()
        assert len(data["posts"]) == 2


class TestTimeline:
    """Test timeline algorithm (business logic)."""

    @pytest.mark.asyncio
    async def test_timeline_shows_own_posts(self, client: AsyncClient, test_user):
        """Timeline shows user's own posts."""
        # Create a post
        await client.post(
            "/v1/posts",
            json={"content": "My post"},
            headers=test_user["headers"],
        )

        # Get timeline
        response = await client.get("/v1/posts", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["posts"][0]["content"] == "My post"

    @pytest.mark.asyncio
    async def test_timeline_shows_followed_posts(
        self, client: AsyncClient, test_user, test_user2
    ):
        """Timeline shows posts from followed users."""
        # User 2 creates a post
        await client.post(
            "/v1/posts",
            json={"content": "User 2's post"},
            headers=test_user2["headers"],
        )

        # User 1 follows User 2
        await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )

        # User 1's timeline should show User 2's post
        response = await client.get("/v1/posts", headers=test_user["headers"])
        data = response.json()
        assert data["total"] == 1
        assert data["posts"][0]["author"]["username"] == "testuser2"

    @pytest.mark.asyncio
    async def test_timeline_excludes_unfollowed(
        self, client: AsyncClient, test_user, test_user2
    ):
        """Timeline excludes posts from users not followed."""
        # User 2 creates a post
        await client.post(
            "/v1/posts",
            json={"content": "Should not appear"},
            headers=test_user2["headers"],
        )

        # User 1 does NOT follow User 2
        # User 1's timeline should be empty
        response = await client.get("/v1/posts", headers=test_user["headers"])
        data = response.json()
        assert data["total"] == 0
