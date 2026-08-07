from pydantic import BaseModel, Field
from typing import Optional

class ReviewCreate(BaseModel):
    restaurant_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: str

class ReviewResponse(BaseModel):
    id: str
    restaurant_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    rating: float
    comment: str
    created_at: str
