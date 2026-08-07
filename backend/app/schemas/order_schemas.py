from pydantic import BaseModel, Field
from typing import List, Optional

class OrderItemSchema(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int
    total_price: float

class CreateOrderRequest(BaseModel):
    delivery_address: str = Field(..., example="123 Main St, Tech City")
    phone: str = Field(..., example="+91 9876543210")
    payment_method: str = Field("upi", example="upi") # upi, card, cod, netbanking
    coupon_code: Optional[str] = None
    order_notes: Optional[str] = None

class OrderStatusUpdateRequest(BaseModel):
    status: str # Pending, Accepted, Preparing, Out for Delivery, Delivered, Cancelled

class OrderResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    customer_email: str
    restaurant_id: str
    restaurant_name: str
    items: List[OrderItemSchema]
    subtotal: float
    gst: float
    delivery_charge: float
    discount: float
    grand_total: float
    status: str
    payment_method: str
    payment_status: str
    delivery_address: str
    phone: str
    order_notes: Optional[str] = None
    created_at: str
    updated_at: str
    qr_code_svg: Optional[str] = None
