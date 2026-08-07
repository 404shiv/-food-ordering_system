from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.favorite_schemas import ToggleFavoriteRequest, FavoriteResponse
from app.utils.auth import get_current_user
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[dict])
async def list_user_favorites(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    fav_col = get_collection("favorites")
    rest_col = get_collection("restaurants")
    menu_col = get_collection("menu_items")

    cursor = fav_col.find({"user_id": user_id})
    all_favs = await cursor.to_list(100)
    res = []

    for f in all_favs:
        f_formatted = format_doc(f)
        target_id = f_formatted["target_id"]
        item_type = f_formatted["item_type"]

        details = None
        if item_type == "restaurant":
            item_doc = await rest_col.find_one({"_id": target_id})
            if item_doc:
                details = format_doc(item_doc)
        elif item_type == "menu_item":
            item_doc = await menu_col.find_one({"_id": target_id})
            if item_doc:
                details = format_doc(item_doc)

        if details:
            f_formatted["details"] = details
            res.append(f_formatted)

    return res

@router.post("/toggle")
async def toggle_favorite(
    payload: ToggleFavoriteRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id") or current_user.get("id"))
    fav_col = get_collection("favorites")

    existing = await fav_col.find_one({
        "user_id": user_id,
        "item_type": payload.item_type,
        "target_id": payload.target_id
    })

    if existing:
        await fav_col.delete_one({"_id": str(existing["_id"])})
        return {"is_favorite": False, "message": "Removed from favorites"}

    doc = {
        "user_id": user_id,
        "item_type": payload.item_type,
        "target_id": payload.target_id
    }
    await fav_col.insert_one(doc)
    return {"is_favorite": True, "message": "Added to favorites"}
