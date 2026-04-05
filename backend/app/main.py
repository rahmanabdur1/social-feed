from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import auth, posts, likes, comments, users
from app.middleware.logging_middleware import log_requests
from app.middleware.security_headers import add_security_headers
from app.database import create_tables
from app.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="Social Feed API",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware
app.middleware("http")(add_security_headers)
app.middleware("http")(log_requests)

# CORS
app.add_middleware(
    CORSMiddleware,
   allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(likes.router)
app.include_router(comments.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "Social Feed API v1 Running ✅"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}