"""Test user endpoints and follow relationships."""

import pytest
from httpx import AsyncClient


class TestFollowRelationships:
    """Test follow/unfollow functionality."""

    @pytest.mark.asyncio
    async def test_follow_user(self, client: AsyncClient, test_user, test_user2):
        """User can follow another user."""
        response = await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )
        assert response.status_code == 204

        # Verify following appears in list
        response = await client.get(
            f"/v1/users/{test_user['user']['id']}/following"
        )
        following = response.json()
        assert len(following) == 1
        assert following[0]["username"] == "testuser2"

    @pytest.mark.asyncio
    async def test_follow_self(self, client: AsyncClient, test_user):
        """User cannot follow themselves."""
        response = await client.post(
            f"/v1/users/me/following/{test_user['user']['id']}",
            headers=test_user["headers"],
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_follow_nonexistent_user(self, client: AsyncClient, test_user):
        """Cannot follow a user that doesn't exist."""
        response = await client.post(
            "/v1/users/me/following/user_nonexistent",
            headers=test_user["headers"],
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_follow_twice(self, client: AsyncClient, test_user, test_user2):
        """Cannot follow the same user twice."""
        # Follow once
        await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )

        # Try to follow again
        response = await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_unfollow_user(self, client: AsyncClient, test_user, test_user2):
        """User can unfollow a followed user."""
        # Follow first
        await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )

        # Unfollow
        response = await client.delete(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )
        assert response.status_code == 204

        # Verify not in following list
        response = await client.get(
            f"/v1/users/{test_user['user']['id']}/following"
        )
        following = response.json()
        assert len(following) == 0

    @pytest.mark.asyncio
    async def test_unfollow_not_followed(self, client: AsyncClient, test_user, test_user2):
        """Cannot unfollow a user not currently followed."""
        response = await client.delete(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )
        assert response.status_code == 404


class TestFollowerCounts:
    """Test that follower/following counts update correctly."""

    @pytest.mark.asyncio
    async def test_follower_count_increases(
        self, client: AsyncClient, test_user, test_user2
    ):
        """Follower count increases when followed."""
        # Get initial count
        response = await client.get(f"/v1/users/{test_user2['user']['id']}")
        initial_count = response.json()["follower_count"]

        # Follow
        await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )

        # Check count increased
        response = await client.get(f"/v1/users/{test_user2['user']['id']}")
        new_count = response.json()["follower_count"]
        assert new_count == initial_count + 1

    @pytest.mark.asyncio
    async def test_following_count_increases(
        self, client: AsyncClient, test_user, test_user2
    ):
        """Following count increases when following someone."""
        # Get initial count
        response = await client.get(f"/v1/users/{test_user['user']['id']}")
        initial_count = response.json()["following_count"]

        # Follow
        await client.post(
            f"/v1/users/me/following/{test_user2['user']['id']}",
            headers=test_user["headers"],
        )

        # Check count increased
        response = await client.get(f"/v1/users/{test_user['user']['id']}")
        new_count = response.json()["following_count"]
        assert new_count == initial_count + 1


class TestGetUser:
    """Test user profile retrieval."""

    @pytest.mark.asyncio
    async def test_get_own_profile(self, client: AsyncClient, test_user):
        """User can get their own profile."""
        response = await client.get("/v1/users/me", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_other_user_profile(self, client: AsyncClient, test_user2):
        """Can get another user's public profile."""
        response = await client.get(f"/v1/users/{test_user2['user']['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser2"

    @pytest.mark.asyncio
    async def test_update_profile(self, client: AsyncClient, test_user):
        """User can update their own profile."""
        response = await client.put(
            "/v1/users/me",
            json={"displayName": "Updated Name", "bio": "New bio"},
            headers=test_user["headers"],
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Updated Name"
        assert data["bio"] == "New bio"
