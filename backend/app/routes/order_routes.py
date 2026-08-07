from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query, Response
from app.schemas.order_schemas import CreateOrderRequest, OrderStatusUpdateRequest, OrderResponse
from app.utils.auth import get_current_user, get_current_admin
from app.utils.helpers import format_docs, format_doc, generate_qr_code_svg
from app.utils.pdf_generator import generate_pdf_invoice
from app.database.db import get_collection
from app.routes.cart_routes import calculate_cart_summary

from bson import ObjectId

router = APIRouter(prefix="/orders", tags=["Orders"])

def get_order_query(order_id: str) -> dict:
    try:
        if ObjectId.is_valid(order_id):
            return {"$or": [{"_id": order_id}, {"_id": ObjectId(order_id)}]}
    except Exception:
        pass
    return {"_id": order_id}

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    payload: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    orders_col = get_collection("orders")
    cart_col = get_collection("cart")
    rest_col = get_collection("restaurants")

    cart_summary = await calculate_cart_summary(user_id, coupon_code=payload.coupon_code)
    if not cart_summary["items"]:
        raise HTTPException(status_code=400, detail="Cannot place order with an empty cart")

    restaurant_id = cart_summary["restaurant_id"]
    restaurant_name = "QuickBite Restaurant"
    if restaurant_id:
        r_doc = await rest_col.find_one({"_id": restaurant_id})
        if r_doc:
            restaurant_name = r_doc.get("name", restaurant_name)

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    order_id = str(ObjectId())
    order_doc = {
        "_id": order_id,
        "customer_id": user_id,
        "customer_name": current_user.get("name", "Customer"),
        "customer_email": current_user.get("email", ""),
        "restaurant_id": restaurant_id or "r1",
        "restaurant_name": restaurant_name,
        "items": cart_summary["items"],
        "subtotal": cart_summary["subtotal"],
        "gst": cart_summary["gst"],
        "delivery_charge": cart_summary["delivery_charge"],
        "discount": cart_summary["discount_amount"],
        "grand_total": cart_summary["grand_total"],
        "status": "Pending",
        "payment_method": payload.payment_method,
        "payment_status": "Paid" if payload.payment_method in ["upi", "card", "netbanking"] else "Pending (COD)",
        "delivery_address": payload.delivery_address,
        "phone": payload.phone,
        "order_notes": payload.order_notes,
        "created_at": now_str,
        "updated_at": now_str
    }

    await orders_col.insert_one(order_doc)
    order_doc["id"] = order_id
    order_doc["qr_code_svg"] = generate_qr_code_svg(order_id, cart_summary["grand_total"], current_user.get("name", ""))

    # Clear user cart after successful order placement
    await cart_col.delete_one({"user_id": user_id})

    return order_doc

@router.get("", response_model=dict)
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    orders_col = get_collection("orders")
    query = {}

    # If customer, only show customer's orders
    if current_user.get("role") != "admin":
        user_id = str(current_user.get("_id") or current_user.get("id"))
        query["customer_id"] = user_id

    if status_filter:
        query["status"] = status_filter

    cursor = orders_col.find(query)
    all_orders = await cursor.to_list(length=1000)
    formatted = format_docs(all_orders)
    formatted.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    total = len(formatted)
    start = (page - 1) * limit
    end = start + limit

    return {
        "items": formatted[start:end],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_by_id(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    orders_col = get_collection("orders")
    order = await orders_col.find_one(get_order_query(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    res = format_doc(order)
    user_id = str(current_user.get("_id") or current_user.get("id"))
    if current_user.get("role") != "admin" and res.get("customer_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied to this order")

    res["qr_code_svg"] = generate_qr_code_svg(res["id"], res.get("grand_total", 0), res.get("customer_name", ""))
    return res

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdateRequest,
    admin: dict = Depends(get_current_admin)
):
    orders_col = get_collection("orders")
    order = await orders_col.find_one(get_order_query(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    update_dict = {"status": payload.status, "updated_at": now_str}
    if payload.status == "Delivered":
        update_dict["payment_status"] = "Paid"

    await orders_col.update_one(get_order_query(order_id), {"$set": update_dict})
    updated = await orders_col.find_one(get_order_query(order_id))
    res = format_doc(updated)
    res["qr_code_svg"] = generate_qr_code_svg(res["id"], res.get("grand_total", 0), res.get("customer_name", ""))
    return res

@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    orders_col = get_collection("orders")
    order = await orders_col.find_one(get_order_query(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user_id = str(current_user.get("_id") or current_user.get("id"))
    if current_user.get("role") != "admin" and order.get("customer_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if order.get("status") in ["Delivered", "Cancelled"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status '{order.get('status')}'")

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    await orders_col.update_one(
        get_order_query(order_id),
        {"$set": {"status": "Cancelled", "updated_at": now_str}}
    )
    return {"message": "Order cancelled successfully"}

@router.get("/{order_id}/invoice")
async def download_order_invoice(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    orders_col = get_collection("orders")
    order = await orders_col.find_one(get_order_query(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    res = format_doc(order)
    user_id = str(current_user.get("_id") or current_user.get("id"))
    if current_user.get("role") != "admin" and res.get("customer_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    pdf_bytes = generate_pdf_invoice(res)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=QuickBite_Invoice_{order_id}.pdf"}
    )
