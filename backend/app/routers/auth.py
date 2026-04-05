from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.user import User
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.services.redis_service import blacklist_token, is_blacklisted
from app.schemas.auth import RegisterSchema, LoginSchema

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/register")
async def register(
    data: RegisterSchema,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Email already registered"
        )

    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(
    data: LoginSchema,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401, detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403, detail="Account is inactive"
        )

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # False for localhost dev
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        },
    }


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str = Cookie(None),
):
    if not refresh_token:
        raise HTTPException(
            status_code=401, detail="No refresh token provided"
        )

    # Check blacklist
    if await is_blacklisted(refresh_token):
        raise HTTPException(
            status_code=401, detail="Session expired, please login again"
        )

    # Decode token
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if not user_id or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(
            status_code=401, detail="Invalid or expired refresh token"
        )

    # Create new tokens
    new_access_token = create_access_token({"sub": user_id})
    new_refresh_token = create_refresh_token({"sub": user_id})

    # Blacklist OLD refresh token
    await blacklist_token(refresh_token)

    # Set NEW refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,  # False for localhost dev
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str = Cookie(None),
):
    if refresh_token:
        await blacklist_token(refresh_token)

    response.delete_cookie(
        key="refresh_token",
        path="/",
    )
    return {"message": "Logged out successfully"}