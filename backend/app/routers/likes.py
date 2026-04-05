from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.models.like import Like
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from app.schemas.like import LikeCreate
from uuid import UUID

router = APIRouter(prefix="/api/v1", tags=["Likes"])


@router.post("/posts/{post_id}/like")
async def toggle_post_like(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Like).where(
            Like.user_id == current_user.id,
            Like.target_id == post_id,
            Like.target_type == "post"
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"message": "Unliked"}

    like = Like(user_id=current_user.id, target_id=post_id, target_type="post")
    db.add(like)
    await db.commit()
    return {"message": "Liked"}


@router.post("/comments/{comment_id}/like")
async def toggle_comment_like(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Like).where(
            Like.user_id == current_user.id,
            Like.target_id == comment_id,
            Like.target_type == "comment"
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"message": "Unliked"}

    like = Like(user_id=current_user.id, target_id=comment_id, target_type="comment")
    db.add(like)
    await db.commit()
    return {"message": "Liked"}


@router.get("/posts/{post_id}/likes")
async def get_post_likes(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Like, User).join(User, Like.user_id == User.id).where(
            Like.target_id == post_id,
            Like.target_type == "post"
        )
    )
    rows = result.all()
    return {
        "total": len(rows),
        "users": [
            {"id": str(u.id), "name": f"{u.first_name} {u.last_name}"}
            for _, u in rows
        ]
    }


@router.get("/comments/{comment_id}/likes")
async def get_comment_likes(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Like, User).join(User, Like.user_id == User.id).where(
            Like.target_id == comment_id,
            Like.target_type == "comment"
        )
    )
    rows = result.all()
    return {
        "total": len(rows),
        "users": [
            {"id": str(u.id), "name": f"{u.first_name} {u.last_name}"}
            for _, u in rows
        ]
    }