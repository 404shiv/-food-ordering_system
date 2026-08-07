from pydantic import BaseModel, Field
from typing import Optional, List

class RestaurantBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: str
    cuisine: List[str]
    address: str
    city: str
    image: str
    rating: float = 4.5
    review_count: int = 0
    opening_hours: str = "09:00 AM - 11:00 PM"
    is_available: bool = True
    delivery_time: str = "30-40 mins"
    delivery_fee: float = 40.0

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine: Optional[List[str]] = None
    address: Optional[str] = None
    city: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    opening_hours: Optional[str] = None
    is_available: Optional[bool] = None
    delivery_time: Optional[str] = None
    delivery_fee: Optional[float] = None

class RestaurantResponse(RestaurantBase):
    id: str
    created_at: Optional[str] = None
