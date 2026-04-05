from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    post_id: UUID
    content: str
    parent_id: Optional[UUID] = None

class CommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    post_id: UUID
    parent_id: Optional[UUID]
    content: str
    created_at: datetime

    class Config:
        from_attributes = True