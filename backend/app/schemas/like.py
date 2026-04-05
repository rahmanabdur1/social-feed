from pydantic import BaseModel
from uuid import UUID
from typing import Literal

class LikeCreate(BaseModel):
    target_id: UUID
    target_type: Literal["post", "comment", "reply"]

class LikeResponse(BaseModel):
    id: UUID
    user_id: UUID
    target_id: UUID
    target_type: str

    class Config:
        from_attributes = True