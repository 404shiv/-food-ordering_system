from pydantic import BaseModel, Field
from typing import Optional

class MenuItemBase(BaseModel):
    restaurant_id: str
    category_id: str
    name: str
    description: str
    price: float = Field(..., gt=0)
    discount: float = 0.0 # Percentage discount
    image: str
    is_veg: bool = True
    is_available: bool = True
    preparation_time: str = "20-25 mins"
    rating: float = 4.5
    review_count: int = 0
    is_popular: bool = False

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount: Optional[float] = None
    image: Optional[str] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None
    preparation_time: Optional[str] = None
    is_popular: Optional[bool] = None

class MenuItemResponse(MenuItemBase):
    id: str
    final_price: float
    restaurant_name: Optional[str] = None
    category_name: Optional[str] = None
