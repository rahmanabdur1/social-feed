from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import get_current_user
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user