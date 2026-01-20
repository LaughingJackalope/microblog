"""User database model with relationships."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.post import Post

# Association table for followers (many-to-many self-referential)
followers = Table(
    "followers",
    Base.metadata,
    Column("follower_id", String(50), ForeignKey("users.id"), primary_key=True),
    Column("followed_id", String(50), ForeignKey("users.id"), primary_key=True),
)


class User(Base, TimestampMixin):
    """User model with follower relationships."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(100))
    bio: Mapped[str | None] = mapped_column(String(250))

    # Relationships
    posts: Mapped[list["Post"]] = relationship(
        "Post", back_populates="author", cascade="all, delete-orphan"
    )

    # Self-referential many-to-many for followers
    following: Mapped[list["User"]] = relationship(
        "User",
        secondary=followers,
        primaryjoin=id == followers.c.follower_id,
        secondaryjoin=id == followers.c.followed_id,
        back_populates="followers",
    )

    followers: Mapped[list["User"]] = relationship(
        "User",
        secondary=followers,
        primaryjoin=id == followers.c.followed_id,
        secondaryjoin=id == followers.c.follower_id,
        back_populates="following",
    )

    @property
    def post_count(self) -> int:
        """Count of posts by this user."""
        return len(self.posts)

    @property
    def follower_count(self) -> int:
        """Count of followers."""
        return len(self.followers)

    @property
    def following_count(self) -> int:
        """Count of users being followed."""
        return len(self.following)

    @property
    def join_date(self) -> datetime:
        """Alias for created_at for API consistency."""
        return self.created_at
