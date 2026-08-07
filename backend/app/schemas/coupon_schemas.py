from pydantic import BaseModel, Field
from typing import Optional

class CouponBase(BaseModel):
    code: str
    discount_percentage: float = Field(..., ge=0.0, le=100.0)
    max_discount_amount: float = 100.0
    min_order_amount: float = 199.0
    is_active: bool = True
    valid_until: Optional[str] = "2026-12-31"

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: str
