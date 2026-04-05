import redis.asyncio as aioredis
from app.config import settings

_redis_client = None


async def get_redis_client():
    global _redis_client
    try:
        if _redis_client is None:
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
        return _redis_client
    except Exception:
        return None


async def cache_set(key: str, value: str, expire: int = 300):
    try:
        r = await get_redis_client()
        if r:
            await r.setex(key, expire, value)
    except Exception:
        pass


async def cache_get(key: str):
    try:
        r = await get_redis_client()
        if r:
            return await r.get(key)
    except Exception:
        pass
    return None


async def cache_delete(key: str):
    try:
        r = await get_redis_client()
        if r:
            await r.delete(key)
    except Exception:
        pass


async def blacklist_token(token: str):
    try:
        r = await get_redis_client()
        if r:
            await r.setex(f"blacklist:{token}", 60 * 60 * 24 * 7, "1")
    except Exception:
        pass


async def is_blacklisted(token: str) -> bool:
    try:
        r = await get_redis_client()
        if r:
            return await r.exists(f"blacklist:{token}") == 1
    except Exception:
        pass
    return False