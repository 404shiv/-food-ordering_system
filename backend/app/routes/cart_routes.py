from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.cart_schemas import CartItemInput, CartSummaryResponse, ApplyCouponRequest
from app.utils.auth import get_current_user
from app.utils.helpers import format_doc
from app.database.db import get_collection
from app.config.settings import settings

router = APIRouter(prefix="/cart", tags=["Cart"])

async def calculate_cart_summary(user_id: str, coupon_code: Optional[str] = None) -> dict:
    cart_col = get_collection("cart")
    menu_col = get_collection("menu_items")
    coupons_col = get_collection("coupons")

    cart_doc = await cart_col.find_one({"user_id": user_id})
    if not cart_doc:
        return {
            "items": [],
            "restaurant_id": None,
            "subtotal": 0.0,
            "gst": 0.0,
            "delivery_charge": 0.0,
            "coupon_code": None,
            "discount_amount": 0.0,
            "grand_total": 0.0
        }

    raw_items = cart_doc.get("items", [])
    if not raw_items:
        return {
            "items": [],
            "restaurant_id": None,
            "subtotal": 0.0,
            "gst": 0.0,
            "delivery_charge": 0.0,
            "coupon_code": None,
            "discount_amount": 0.0,
            "grand_total": 0.0
        }

    processed_items = []
    subtotal = 0.0
    restaurant_id = None

    for item in raw_items:
        m_item = await menu_col.find_one({"_id": item["menu_item_id"]})
        if m_item:
            price = m_item.get("price", 0.0)
            discount = m_item.get("discount", 0.0)
            final_price = round(price * (1 - discount / 100.0), 2)
            quantity = item.get("quantity", 1)
            item_total = round(final_price * quantity, 2)
            subtotal += item_total
            restaurant_id = m_item.get("restaurant_id")

            processed_items.append({
                "menu_item_id": item["menu_item_id"],
                "name": m_item.get("name", "Food Item"),
                "price": price,
                "discount": discount,
                "final_price": final_price,
                "image": m_item.get("image", ""),
                "is_veg": m_item.get("is_veg", True),
                "restaurant_id": restaurant_id,
                "quantity": quantity,
                "total_price": item_total
            })

    active_coupon = coupon_code or cart_doc.get("coupon_code")
    discount_amount = 0.0

    if active_coupon:
        cpn = await coupons_col.find_one({"code": active_coupon.upper(), "is_active": True})
        if cpn and subtotal >= cpn.get("min_order_amount", 0.0):
            pct = cpn.get("discount_percentage", 0.0)
            max_disc = cpn.get("max_discount_amount", 100.0)
            calculated = round((subtotal * pct) / 100.0, 2)
            discount_amount = min(calculated, max_disc)

    gst = round((subtotal * settings.GST_PERCENTAGE) / 100.0, 2)
    delivery_charge = 0.0 if subtotal >= settings.FREE_DELIVERY_THRESHOLD or subtotal == 0 else settings.DEFAULT_DELIVERY_CHARGE
    grand_total = max(0.0, round(subtotal + gst + delivery_charge - discount_amount, 2))

    return {
        "items": processed_items,
        "restaurant_id": restaurant_id,
        "subtotal": round(subtotal, 2),
        "gst": gst,
        "delivery_charge": delivery_charge,
        "coupon_code": active_coupon if discount_amount > 0 else None,
        "discount_amount": discount_amount,
        "grand_total": grand_total
    }

@router.get("", response_model=CartSummaryResponse)
async def get_user_cart(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await calculate_cart_summary(user_id)

@router.post("/items")
async def add_item_to_cart(
    payload: CartItemInput,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cart_col = get_collection("cart")
    menu_col = get_collection("menu_items")

    menu_item = await menu_col.find_one({"_id": payload.menu_item_id})
    if not menu_item:
        raise HTTPException(status_code=404, detail="Food item not found")

    cart_doc = await cart_col.find_one({"user_id": user_id})
    if not cart_doc:
        cart_doc = {"user_id": user_id, "items": [], "coupon_code": None}

    items = cart_doc.get("items", [])
    
    # Check single restaurant restriction in cart
    if items:
        existing_first_item = await menu_col.find_one({"_id": items[0]["menu_item_id"]})
        if existing_first_item and existing_first_item.get("restaurant_id") != menu_item.get("restaurant_id"):
            # Replace cart items if adding from a different restaurant
            items = []

    # Update item if exists or add
    found = False
    for item in items:
        if item["menu_item_id"] == payload.menu_item_id:
            item["quantity"] += payload.quantity
            found = True
            break
            
    if not found:
        items.append({"menu_item_id": payload.menu_item_id, "quantity": payload.quantity})

    await cart_col.update_one(
        {"user_id": user_id},
        {"$set": {"user_id": user_id, "items": items}},
        upsert=True
    )
    return await calculate_cart_summary(user_id)

@router.put("/items/{menu_item_id}")
async def update_cart_item_quantity(
    menu_item_id: str,
    payload: CartItemInput,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cart_col = get_collection("cart")

    cart_doc = await cart_col.find_one({"user_id": user_id})
    if not cart_doc:
        raise HTTPException(status_code=404, detail="Cart is empty")

    items = cart_doc.get("items", [])
    if payload.quantity <= 0:
        items = [i for i in items if i["menu_item_id"] != menu_item_id]
    else:
        for item in items:
            if item["menu_item_id"] == menu_item_id:
                item["quantity"] = payload.quantity
                break

    await cart_col.update_one({"user_id": user_id}, {"$set": {"items": items}})
    return await calculate_cart_summary(user_id)

@router.delete("/items/{menu_item_id}")
async def remove_item_from_cart(
    menu_item_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cart_col = get_collection("cart")

    cart_doc = await cart_col.find_one({"user_id": user_id})
    if cart_doc:
        items = [i for i in cart_doc.get("items", []) if i["menu_item_id"] != menu_item_id]
        await cart_col.update_one({"user_id": user_id}, {"$set": {"items": items}})

    return await calculate_cart_summary(user_id)

@router.post("/apply-coupon")
async def apply_coupon(
    payload: ApplyCouponRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cart_col = get_collection("cart")
    coupons_col = get_collection("coupons")

    coupon = await coupons_col.find_one({"code": payload.coupon_code.upper(), "is_active": True})
    if not coupon:
        raise HTTPException(status_code=400, detail="Invalid or expired coupon code")

    await cart_col.update_one({"user_id": user_id}, {"$set": {"coupon_code": payload.coupon_code.upper()}})
    return await calculate_cart_summary(user_id, coupon_code=payload.coupon_code)

@router.delete("/clear")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    cart_col = get_collection("cart")
    await cart_col.delete_one({"user_id": user_id})
    return {"message": "Cart cleared successfully"}
