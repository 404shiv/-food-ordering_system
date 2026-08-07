from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.category_schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.utils.auth import get_current_admin
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    cat_col = get_collection("categories")
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if is_active is not None:
        query["is_active"] = is_active
        
    cursor = cat_col.find(query)
    all_cats = await cursor.to_list(length=100)
    return format_docs(all_cats)

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    admin: dict = Depends(get_current_admin)
):
    cat_col = get_collection("categories")
    doc = data.model_dump()
    res = await cat_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    admin: dict = Depends(get_current_admin)
):
    cat_col = get_collection("categories")
    cat = await cat_col.find_one({"_id": category_id})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await cat_col.update_one({"_id": category_id}, {"$set": update_data})
        
    updated = await cat_col.find_one({"_id": category_id})
    return format_doc(updated)

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    admin: dict = Depends(get_current_admin)
):
    cat_col = get_collection("categories")
    res = await cat_col.delete_one({"_id": category_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
