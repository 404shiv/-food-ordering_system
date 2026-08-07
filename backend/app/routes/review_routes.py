from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.review_schemas import ReviewCreate, ReviewResponse
from app.utils.auth import get_current_user, get_current_admin
from app.utils.helpers import format_docs, format_doc
from app.database.db import get_collection

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("", response_model=List[ReviewResponse])
async def get_reviews(
    restaurant_id: str = Query(...)
):
    reviews_col = get_collection("reviews")
    cursor = reviews_col.find({"restaurant_id": restaurant_id})
    all_rev = await cursor.to_list(length=100)
    formatted = format_docs(all_rev)
    formatted.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return formatted

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    reviews_col = get_collection("reviews")
    rest_col = get_collection("restaurants")
    user_id = str(current_user.get("_id") or current_user.get("id"))

    doc = {
        "restaurant_id": payload.restaurant_id,
        "user_id": user_id,
        "user_name": current_user.get("name", "User"),
        "user_avatar": current_user.get("avatar", ""),
        "rating": payload.rating,
        "comment": payload.comment,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }

    res = await reviews_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)

    # Recalculate restaurant rating
    all_rest_reviews = await reviews_col.find({"restaurant_id": payload.restaurant_id}).to_list(1000)
    if all_rest_reviews:
        avg_rating = round(sum(r["rating"] for r in all_rest_reviews) / len(all_rest_reviews), 1)
        await rest_col.update_one(
            {"_id": payload.restaurant_id},
            {"$set": {"rating": avg_rating, "review_count": len(all_rest_reviews)}}
        )

    return doc

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    admin: dict = Depends(get_current_admin)
):
    reviews_col = get_collection("reviews")
    res = await reviews_col.delete_one({"_id": review_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}
