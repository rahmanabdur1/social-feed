from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class PostCreate(BaseModel):
    content: str
    is_private: bool = False

class PostResponse(BaseModel):
    id: UUID
    content: str
    image_url: Optional[str]
    is_private: bool
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True