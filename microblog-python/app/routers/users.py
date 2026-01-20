"""User management endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db.user import User
from app.dependencies import CurrentUser
from app.models.user import UserPublic, UserUpdate

router = APIRouter(prefix="/v1/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def get_current_user_profile(current_user: CurrentUser) -> UserPublic:
    """Get the authenticated user's profile."""
    return UserPublic.model_validate(current_user)


@router.put("/me", response_model=UserPublic)
async def update_current_user_profile(
    updates: UserUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserPublic:
    """Update the authenticated user's profile."""
    if updates.display_name is not None:
        current_user.display_name = updates.display_name
    if updates.bio is not None:
        current_user.bio = updates.bio

    await db.flush()
    await db.refresh(current_user)

    return UserPublic.model_validate(current_user)


@router.get("/{user_id}", response_model=UserPublic)
async def get_user_by_id(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserPublic:
    """Get a user's public profile by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserPublic.model_validate(user)


@router.post("/me/following/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def follow_user(
    user_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Follow another user."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself",
        )

    # Check if target user exists
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check if already following
    if target_user in current_user.following:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already following this user",
        )

    current_user.following.append(target_user)
    await db.flush()


@router.delete("/me/following/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(
    user_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Unfollow a user."""
    # Find the user to unfollow
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check if actually following
    if target_user not in current_user.following:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not following this user",
        )

    current_user.following.remove(target_user)
    await db.flush()


@router.get("/{user_id}/followers", response_model=list[UserPublic])
async def get_followers(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserPublic]:
    """Get a user's followers."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return [UserPublic.model_validate(follower) for follower in user.followers]


@router.get("/{user_id}/following", response_model=list[UserPublic])
async def get_following(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserPublic]:
    """Get users that this user follows."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return [UserPublic.model_validate(followed) for followed in user.following]
