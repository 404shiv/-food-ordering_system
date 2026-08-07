from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.coupon_schemas import CouponCreate, CouponResponse
from app.utils.auth import get_current_admin, get_current_user
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.get("", response_model=List[CouponResponse])
async def list_coupons():
    coupons_col = get_collection("coupons")
    cursor = coupons_col.find({"is_active": True})
    docs = await cursor.to_list(100)
    return format_docs(docs)

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    data: CouponCreate,
    admin: dict = Depends(get_current_admin)
):
    coupons_col = get_collection("coupons")
    existing = await coupons_col.find_one({"code": data.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    doc = data.model_dump()
    doc["code"] = doc["code"].upper()
    res = await coupons_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc

@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    admin: dict = Depends(get_current_admin)
):
    coupons_col = get_collection("coupons")
    res = await coupons_col.delete_one({"_id": coupon_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}
