"""Authentication endpoints."""

from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.db.user import User
from app.models.auth import TokenRequest, TokenResponse
from app.models.user import UserCreate, UserPublic
from app.security import create_access_token, get_password_hash, verify_password
from app.services.users import UserService

router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]
) -> UserPublic:
    """Register a new user account."""
    # Check if username exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered",
        )

    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create new user
    user = User(
        id=f"user_{uuid4()}",
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        display_name=user_data.display_name,
        bio=user_data.bio,
    )

    db.add(user)
    await db.flush()
    await db.refresh(user)

    user_with_counts = await UserService.get_user_with_counts(db, user.id)
    return UserPublic.model_validate(user_with_counts)


@router.post("/token", response_model=TokenResponse)
async def login(
    credentials: TokenRequest, db: Annotated[AsyncSession, Depends(get_db)]
) -> TokenResponse:
    """Authenticate and receive access token."""
    # Find user by username
    result = await db.execute(select(User).where(User.username == credentials.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(user.id, user.username)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )
