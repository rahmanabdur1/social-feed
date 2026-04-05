import time
import logging
from fastapi import Request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("social_feed")


async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round(time.time() - start, 4)
    logger.info(
        f"{request.method} {request.url.path} "
        f"status={response.status_code} duration={duration}s"
    )
    return response