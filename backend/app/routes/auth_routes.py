from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth_schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, ProfileUpdateRequest, ChangePasswordRequest
)
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.utils.helpers import format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegisterRequest):
    users_col = get_collection("users")
    existing_user = await users_col.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )
    
    new_user = {
        "_id": str(ObjectId()),
        "name": user_data.name,
        "email": user_data.email.lower(),
        "phone": user_data.phone or "",
        "hashed_password": get_password_hash(user_data.password),
        "role": user_data.role if user_data.role in ["customer", "admin"] else "customer",
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}",
        "is_active": True,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    res = await users_col.insert_one(new_user)
    new_user["id"] = new_user["_id"]
    if "_id" in new_user:
        del new_user["_id"]
    if "hashed_password" in new_user:
        del new_user["hashed_password"]
    
    token = create_access_token({"sub": new_user["id"], "role": new_user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLoginRequest):
    users_col = get_collection("users")
    user = await users_col.find_one({"email": credentials.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    formatted_user = format_doc(user)
    if "hashed_password" in formatted_user:
        del formatted_user["hashed_password"]
    
    token = create_access_token({"sub": formatted_user["id"], "role": formatted_user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": formatted_user}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = format_doc(current_user)
    if "hashed_password" in user:
        del user["hashed_password"]
    return user

@router.put("/profile")
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    users_col = get_collection("users")
    user_id = str(current_user.get("_id") or current_user.get("id"))
    
    update_fields = {}
    if profile_data.name is not None:
        update_fields["name"] = profile_data.name
    if profile_data.phone is not None:
        update_fields["phone"] = profile_data.phone
    if profile_data.avatar is not None:
        update_fields["avatar"] = profile_data.avatar
    if profile_data.address is not None:
        update_fields["address"] = profile_data.address
        
    if update_fields:
        await users_col.update_one({"_id": user_id}, {"$set": update_fields})
        
    updated_user = await users_col.find_one({"_id": user_id})
    res_user = format_doc(updated_user)
    if "hashed_password" in res_user:
        del res_user["hashed_password"]
    return res_user

@router.put("/change-password")
async def change_password(
    pwd_data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    users_col = get_collection("users")
    user_id = str(current_user.get("_id") or current_user.get("id"))
    
    if not verify_password(pwd_data.old_password, current_user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match"
        )
    
    new_hashed = get_password_hash(pwd_data.new_password)
    await users_col.update_one({"_id": user_id}, {"$set": {"hashed_password": new_hashed}})
    return {"message": "Password updated successfully"}
