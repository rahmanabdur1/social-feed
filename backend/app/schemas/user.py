from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True