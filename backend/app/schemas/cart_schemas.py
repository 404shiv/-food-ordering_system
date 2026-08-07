from pydantic import BaseModel
from typing import List, Optional

class CartItemInput(BaseModel):
    menu_item_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    menu_item_id: str
    name: str
    price: float
    discount: float
    final_price: float
    image: str
    is_veg: bool
    restaurant_id: str
    quantity: int
    total_price: float

class CartSummaryResponse(BaseModel):
    items: List[CartItemResponse]
    restaurant_id: Optional[str] = None
    subtotal: float
    gst: float
    delivery_charge: float
    coupon_code: Optional[str] = None
    discount_amount: float = 0.0
    grand_total: float

class ApplyCouponRequest(BaseModel):
    coupon_code: str
