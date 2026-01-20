"""Test authentication endpoints and security."""

import pytest
from httpx import AsyncClient


class TestRegistration:
    """Test user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """Successful registration should return 201 with user data."""
        response = await client.post(
            "/v1/auth/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "securepass123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "new@example.com"
        assert "password" not in data  # Password should not be in response
        assert "id" in data
        assert data["id"].startswith("user_")

    @pytest.mark.asyncio
    async def test_register_duplicate_username(self, client: AsyncClient, test_user):
        """Cannot register with existing username."""
        response = await client.post(
            "/v1/auth/register",
            json={
                "username": "testuser",  # Already exists
                "email": "different@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 409
        assert "username" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, test_user):
        """Cannot register with existing email."""
        response = await client.post(
            "/v1/auth/register",
            json={
                "username": "differentuser",
                "email": "test@example.com",  # Already exists
                "password": "password123",
            },
        )
        assert response.status_code == 409
        assert "email" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_invalid_data(self, client: AsyncClient):
        """Registration with invalid data should return 422."""
        response = await client.post(
            "/v1/auth/register",
            json={
                "username": "ab",  # Too short
                "email": "not-an-email",
                "password": "short",
            },
        )
        assert response.status_code == 422


class TestLogin:
    """Test login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user):
        """Successful login should return token."""
        response = await client.post(
            "/v1/auth/token",
            json={"username": "testuser", "password": "testpass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        """Login with wrong password should fail."""
        response = await client.post(
            "/v1/auth/token",
            json={"username": "testuser", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Login with nonexistent user should fail."""
        response = await client.post(
            "/v1/auth/token",
            json={"username": "nosuchuser", "password": "password123"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client: AsyncClient):
        """Login with missing fields should return 422."""
        response = await client.post("/v1/auth/token", json={"username": "testuser"})
        assert response.status_code == 422


class TestPasswordHashing:
    """Test that passwords are properly hashed."""

    @pytest.mark.asyncio
    async def test_password_not_stored_plaintext(self, test_db, test_user):
        """Passwords should be hashed, not stored in plaintext."""
        from sqlalchemy import select

        from app.db.user import User

        result = await test_db.execute(
            select(User).where(User.username == "testuser")
        )
        user = result.scalar_one()

        # Password hash should not match plaintext
        assert user.password_hash != "testpass123"
        # Should start with bcrypt prefix
        assert user.password_hash.startswith("$2b$")
