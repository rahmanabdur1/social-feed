from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.post import Post
from app.middleware.auth_middleware import get_current_user
from app.services.image_service import upload_image
from app.services.feed_service import get_feed
from app.services.redis_service import cache_delete
from uuid import UUID

router = APIRouter(prefix="/api/v1/posts", tags=["Posts"])


@router.get("")
async def get_posts(
    cursor: str = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    posts = await get_feed(db, current_user.id, cursor, limit)
    next_cursor = posts[-1]["id"] if posts else None
    return {"posts": posts, "next_cursor": next_cursor}


@router.post("")
async def create_post(
    content: str = Form(...),
    is_private: bool = Form(False),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    image_url = None
    if image and image.filename:
        image_url = await upload_image(image)

    post = Post(
        user_id=current_user.id,
        content=content,
        image_url=image_url,
        is_private=is_private,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    await cache_delete(f"feed:{current_user.id}:*")

    return {
        "message": "Post created",
        "post": {
            "id": str(post.id),
            "content": post.content,
            "image_url": post.image_url,
            "is_private": post.is_private,
            "created_at": str(post.created_at),
        },
    }


@router.get("/{post_id}")
async def get_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.is_private and post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return {
        "id": str(post.id),
        "content": post.content,
        "image_url": post.image_url,
        "is_private": post.is_private,
        "user_id": str(post.user_id),
        "created_at": str(post.created_at),
    }


@router.delete("/{post_id}")
async def delete_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.delete(post)
    await db.commit()
    await cache_delete(f"feed:{current_user.id}:*")
    return {"message": "Post deleted"}