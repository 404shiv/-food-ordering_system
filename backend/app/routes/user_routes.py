from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.user_schemas import UserResponse, UserUpdateRoleRequest
from app.utils.auth import get_current_admin
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: str = Query(None),
    search: str = Query(None),
    admin: dict = Depends(get_current_admin)
):
    users_col = get_collection("users")
    query = {}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = users_col.find(query)
    all_users = await cursor.to_list(length=1000)
    formatted = format_docs(all_users)
    for u in formatted:
        if "hashed_password" in u:
            del u["hashed_password"]
            
    total = len(formatted)
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "items": formatted[start:end],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_status_role(
    user_id: str,
    payload: UserUpdateRoleRequest,
    admin: dict = Depends(get_current_admin)
):
    users_col = get_collection("users")
    user = await users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await users_col.update_one(
        {"_id": user_id},
        {"$set": {"role": payload.role, "is_active": payload.is_active}}
    )
    
    updated = await users_col.find_one({"_id": user_id})
    res = format_doc(updated)
    if "hashed_password" in res:
        del res["hashed_password"]
    return res
