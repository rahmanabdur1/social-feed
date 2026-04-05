import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from app.models.post import Post
from app.services.redis_service import cache_get, cache_set
from uuid import UUID
from datetime import datetime


async def get_feed(
    db: AsyncSession,
    user_id: UUID,
    cursor: str = None,
    limit: int = 10,
):
    cache_key = f"feed:{user_id}:{cursor}:{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    query = (
        select(Post)
        .where(
            (Post.is_private == False) | (Post.user_id == user_id)
        )
        .order_by(Post.created_at.desc())
        .limit(limit)
    )

    # cursor is a post ID (UUID), not a timestamp
    if cursor:
        try:
            cursor_uuid = UUID(cursor)
            # Get the created_at of the cursor post first
            cursor_result = await db.execute(
                select(Post.created_at).where(Post.id == cursor_uuid)
            )
            cursor_time = cursor_result.scalar_one_or_none()
            if cursor_time:
                query = (
                    select(Post)
                    .where(
                        (Post.is_private == False) | (Post.user_id == user_id),
                        Post.created_at < cursor_time
                    )
                    .order_by(Post.created_at.desc())
                    .limit(limit)
                )
        except (ValueError, Exception):
            pass

    result = await db.execute(query)
    posts = result.scalars().all()

    data = [
        {
            "id": str(p.id),
            "content": p.content,
            "image_url": p.image_url,
            "is_private": p.is_private,
            "user_id": str(p.user_id),
            "created_at": str(p.created_at),
        }
        for p in posts
    ]

    await cache_set(cache_key, json.dumps(data), expire=60)
    return data