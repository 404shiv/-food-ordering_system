from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.menu_schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.utils.auth import get_current_admin
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/menu", tags=["Menu Items"])

@router.get("", response_model=dict)
async def list_menu_items(
    restaurant_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_veg: Optional[bool] = Query(None),
    is_available: Optional[bool] = Query(None),
    is_popular: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query(None), # 'price_asc', 'price_desc', 'rating', 'popular'
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    menu_col = get_collection("menu_items")
    rest_col = get_collection("restaurants")
    cat_col = get_collection("categories")
    
    query = {}
    if restaurant_id:
        query["restaurant_id"] = restaurant_id
    if category_id:
        query["category_id"] = category_id
    if is_veg is not None:
        query["is_veg"] = is_veg
    if is_available is not None:
        query["is_available"] = is_available
    if is_popular is not None:
        query["is_popular"] = is_popular
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = menu_col.find(query)
    raw_items = await cursor.to_list(length=1000)
    formatted = format_docs(raw_items)
    
    # Pre-fetch restaurant and category names for display
    restaurants = {r["id"]: r.get("name") for r in format_docs(await rest_col.find().to_list(100))}
    categories = {c["id"]: c.get("name") for c in format_docs(await cat_col.find().to_list(100))}
    
    for item in formatted:
        price = item.get("price", 0)
        discount = item.get("discount", 0)
        item["final_price"] = round(price * (1 - discount / 100.0), 2)
        item["restaurant_name"] = restaurants.get(item.get("restaurant_id"), "Restaurant")
        item["category_name"] = categories.get(item.get("category_id"), "Category")

    # Sorting
    if sort_by == "price_asc":
        formatted.sort(key=lambda x: x["final_price"])
    elif sort_by == "price_desc":
        formatted.sort(key=lambda x: x["final_price"], reverse=True)
    elif sort_by == "rating":
        formatted.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "popular":
        formatted.sort(key=lambda x: x.get("is_popular", False), reverse=True)
        
    total = len(formatted)
    start = (page - 1) * limit
    end = start + limit

    return {
        "items": formatted[start:end],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{menu_item_id}", response_model=MenuItemResponse)
async def get_menu_item_by_id(menu_item_id: str):
    menu_col = get_collection("menu_items")
    item = await menu_col.find_one({"_id": menu_item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    res = format_doc(item)
    price = res.get("price", 0)
    discount = res.get("discount", 0)
    res["final_price"] = round(price * (1 - discount / 100.0), 2)
    return res

@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    data: MenuItemCreate,
    admin: dict = Depends(get_current_admin)
):
    menu_col = get_collection("menu_items")
    doc = data.model_dump()
    res = await menu_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    price = doc.get("price", 0)
    discount = doc.get("discount", 0)
    doc["final_price"] = round(price * (1 - discount / 100.0), 2)
    return doc

@router.put("/{menu_item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    menu_item_id: str,
    data: MenuItemUpdate,
    admin: dict = Depends(get_current_admin)
):
    menu_col = get_collection("menu_items")
    item = await menu_col.find_one({"_id": menu_item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await menu_col.update_one({"_id": menu_item_id}, {"$set": update_data})
        
    updated = await menu_col.find_one({"_id": menu_item_id})
    res = format_doc(updated)
    price = res.get("price", 0)
    discount = res.get("discount", 0)
    res["final_price"] = round(price * (1 - discount / 100.0), 2)
    return res

@router.delete("/{menu_item_id}")
async def delete_menu_item(
    menu_item_id: str,
    admin: dict = Depends(get_current_admin)
):
    menu_col = get_collection("menu_items")
    res = await menu_col.delete_one({"_id": menu_item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}
