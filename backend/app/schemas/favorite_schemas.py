from pydantic import BaseModel
from typing import Optional

class ToggleFavoriteRequest(BaseModel):
    item_type: str # 'restaurant' or 'menu_item'
    target_id: str

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    item_type: str
    target_id: str
    details: Optional[dict] = None
