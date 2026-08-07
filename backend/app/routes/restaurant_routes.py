from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.restaurant_schemas import RestaurantCreate, RestaurantUpdate, RestaurantResponse
from app.utils.auth import get_current_admin
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

@router.get("", response_model=dict)
async def list_restaurants(
    search: Optional[str] = Query(None),
    cuisine: Optional[str] = Query(None),
    rating: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("rating"), # 'rating', 'newest', 'oldest'
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
):
    rest_col = get_collection("restaurants")
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}}
        ]
        
    if cuisine:
        query["cuisine"] = {"$in": [cuisine]}
        
    if rating:
        query["rating"] = {"$gte": rating}
        
    cursor = rest_col.find(query)
    all_rest = await cursor.to_list(length=1000)
    formatted = format_docs(all_rest)
    
    # Sorting logic
    if sort_by == "rating":
        formatted.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "newest":
        formatted.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    elif sort_by == "oldest":
        formatted.sort(key=lambda x: x.get("created_at", ""))
        
    total = len(formatted)
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "items": formatted[start:end],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant_by_id(restaurant_id: str):
    rest_col = get_collection("restaurants")
    rest = await rest_col.find_one({"_id": restaurant_id})
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return format_doc(rest)

@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    data: RestaurantCreate,
    admin: dict = Depends(get_current_admin)
):
    rest_col = get_collection("restaurants")
    doc = data.model_dump()
    doc["created_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    res = await rest_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc

@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    data: RestaurantUpdate,
    admin: dict = Depends(get_current_admin)
):
    rest_col = get_collection("restaurants")
    rest = await rest_col.find_one({"_id": restaurant_id})
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await rest_col.update_one({"_id": restaurant_id}, {"$set": update_data})
        
    updated = await rest_col.find_one({"_id": restaurant_id})
    return format_doc(updated)

@router.delete("/{restaurant_id}")
async def delete_restaurant(
    restaurant_id: str,
    admin: dict = Depends(get_current_admin)
):
    rest_col = get_collection("restaurants")
    res = await rest_col.delete_one({"_id": restaurant_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"message": "Restaurant deleted successfully"}
