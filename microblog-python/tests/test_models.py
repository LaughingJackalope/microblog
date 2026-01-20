"""Test Pydantic models for validation."""

import pytest
from pydantic import ValidationError

from app.models.post import PostCreate
from app.models.user import UserCreate


class TestUserCreateValidation:
    """Test UserCreate Pydantic validation."""

    def test_valid_user(self):
        """Valid user data should pass."""
        user = UserCreate(
            username="validuser",
            email="valid@example.com",
            password="securepass123",
        )
        assert user.username == "validuser"
        assert user.email == "valid@example.com"

    def test_username_too_short(self):
        """Username must be at least 3 characters."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="ab",
                email="test@example.com",
                password="password123",
            )
        errors = exc_info.value.errors()
        assert any("at least 3 characters" in str(e) for e in errors)

    def test_username_invalid_chars(self):
        """Username must only contain alphanumeric and underscore/hyphen."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="user@name",
                email="test@example.com",
                password="password123",
            )

    def test_invalid_email(self):
        """Email must be valid format."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="validuser",
                email="not-an-email",
                password="password123",
            )

    def test_password_too_short(self):
        """Password must be at least 8 characters."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="validuser",
                email="test@example.com",
                password="short",
            )
        errors = exc_info.value.errors()
        assert any("at least 8 characters" in str(e) for e in errors)

    def test_display_name_too_long(self):
        """Display name must not exceed 100 characters."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="validuser",
                email="test@example.com",
                password="password123",
                display_name="a" * 101,
            )

    def test_bio_too_long(self):
        """Bio must not exceed 250 characters."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="validuser",
                email="test@example.com",
                password="password123",
                bio="a" * 251,
            )


class TestPostCreateValidation:
    """Test PostCreate Pydantic validation."""

    def test_valid_post(self):
        """Valid post data should pass."""
        post = PostCreate(content="This is a valid post")
        assert post.content == "This is a valid post"

    def test_empty_content(self):
        """Content cannot be empty."""
        with pytest.raises(ValidationError):
            PostCreate(content="")

    def test_content_too_long(self):
        """Content must not exceed 280 characters."""
        with pytest.raises(ValidationError) as exc_info:
            PostCreate(content="a" * 281)
        errors = exc_info.value.errors()
        assert any("at most 280 characters" in str(e) for e in errors)

    def test_content_at_limit(self):
        """Content at exactly 280 characters should pass."""
        content = "a" * 280
        post = PostCreate(content=content)
        assert len(post.content) == 280
