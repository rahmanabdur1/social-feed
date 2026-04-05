from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from app.schemas.comment import CommentCreate, CommentResponse
from uuid import UUID
from typing import List

router = APIRouter(prefix="/api/v1/comments", tags=["Comments"])


@router.post("", response_model=CommentResponse)
async def create_comment(
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = Comment(
        user_id=current_user.id,
        post_id=data.post_id,
        content=data.content,
        parent_id=data.parent_id
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


@router.get("/{post_id}", response_model=List[CommentResponse])
async def get_comments(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Comment)
        .where(Comment.post_id == post_id, Comment.parent_id == None)
        .order_by(Comment.created_at.asc())
    )
    comments = result.scalars().all()
    return comments


@router.get("/{post_id}/replies/{comment_id}", response_model=List[CommentResponse])
async def get_replies(
    post_id: UUID,
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Comment)
        .where(Comment.parent_id == comment_id)
        .order_by(Comment.created_at.asc())
    )
    replies = result.scalars().all()
    return replies


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.delete(comment)
    await db.commit()
    return {"message": "Comment deleted"}