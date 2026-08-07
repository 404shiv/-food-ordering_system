import asyncio
from datetime import datetime
from app.database.db import connect_to_mongo, get_collection
from app.utils.auth import get_password_hash

async def seed_database():
    await connect_to_mongo()
    print("[SEED] Seeding QuickBite Database with high-quality sample data...")

    users_col = get_collection("users")
    categories_col = get_collection("categories")
    restaurants_col = get_collection("restaurants")
    menu_col = get_collection("menu_items")
    coupons_col = get_collection("coupons")
    reviews_col = get_collection("reviews")
    orders_col = get_collection("orders")

    # Clear existing data
    await users_col.delete_many({})
    await categories_col.delete_many({})
    await restaurants_col.delete_many({})
    await menu_col.delete_many({})
    await coupons_col.delete_many({})
    await reviews_col.delete_many({})
    await orders_col.delete_many({})

    # 1. Users
    admin_user = {
        "_id": "admin_1",
        "name": "System Admin",
        "email": "admin@quickbite.com",
        "phone": "+91 9999988888",
        "hashed_password": get_password_hash("admin123"),
        "role": "admin",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "is_active": True,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }

    customer_user = {
        "_id": "customer_1",
        "name": "Alex Johnson",
        "email": "john@quickbite.com",
        "phone": "+91 9876543210",
        "hashed_password": get_password_hash("customer123"),
        "role": "customer",
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "is_active": True,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }

    await users_col.insert_many([admin_user, customer_user])
    print("[SUCCESS] Users seeded (Admin: admin@quickbite.com / admin123, Customer: john@quickbite.com / customer123)")

    # 2. Categories
    categories = [
        {"_id": "c1", "name": "North Indian", "description": "Rich curries, tandoori breads & aromatic gravies", "icon": "🍲", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", "is_active": True},
        {"_id": "c2", "name": "Italian & Pizza", "description": "Wood-fired pizzas, artisanal pasta & creamy risottos", "icon": "🍕", "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", "is_active": True},
        {"_id": "c3", "name": "Burgers & Fast Food", "description": "Juicy gourmet burgers, crispy fries & wings", "icon": "🍔", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", "is_active": True},
        {"_id": "c4", "name": "Asian & Chinese", "description": "Flavorful dim sums, wok-tossed noodles & gravies", "icon": "🍜", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", "is_active": True},
        {"_id": "c5", "name": "Biryani Special", "description": "Authentic dum biryanis cooked to perfection", "icon": "🍚", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", "is_active": True},
        {"_id": "c6", "name": "Desserts & Shakes", "description": "Decadent cakes, ice creams & thick shakes", "icon": "🍰", "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400", "is_active": True},
    ]
    await categories_col.insert_many(categories)
    print("[SUCCESS] Categories seeded")

    # 3. Restaurants
    restaurants = [
        {
            "_id": "r1",
            "name": "Spice Garden Fine Dining",
            "description": "Authentic North Indian & Mughlai delicacies crafted by master chefs.",
            "cuisine": ["North Indian", "Biryani", "Tandoor"],
            "address": "45 Park Avenue, Connaught Place",
            "city": "New Delhi",
            "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            "rating": 4.8,
            "review_count": 240,
            "opening_hours": "11:00 AM - 11:30 PM",
            "is_available": True,
            "delivery_time": "25-35 mins",
            "delivery_fee": 35.0,
            "created_at": "2026-01-10 10:00:00"
        },
        {
            "_id": "r2",
            "name": "Bella Italia Pizzeria",
            "description": "Handcrafted Neapolitan pizzas made with imported Italian mozzarella.",
            "cuisine": ["Italian & Pizza", "Pasta", "Salads"],
            "address": "12 Galleria Boulevard, MG Road",
            "city": "Bengaluru",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            "rating": 4.7,
            "review_count": 185,
            "opening_hours": "12:00 PM - 11:00 PM",
            "is_available": True,
            "delivery_time": "30-40 mins",
            "delivery_fee": 40.0,
            "created_at": "2026-01-12 11:00:00"
        },
        {
            "_id": "r3",
            "name": "Burger Craft & Grills",
            "description": "Premium smash burgers, loaded fries, and signature milkshakes.",
            "cuisine": ["Burgers & Fast Food", "Desserts & Shakes"],
            "address": "88 Food Court Street, Bandra West",
            "city": "Mumbai",
            "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
            "rating": 4.6,
            "review_count": 310,
            "opening_hours": "11:00 AM - 01:00 AM",
            "is_available": True,
            "delivery_time": "20-30 mins",
            "delivery_fee": 30.0,
            "created_at": "2026-01-15 12:00:00"
        },
        {
            "_id": "r4",
            "name": "Dragon Wok Asian Bistro",
            "description": "Authentic Sichuan & Pan-Asian street food cooked fresh in hot woks.",
            "cuisine": ["Asian & Chinese", "Seafood"],
            "address": "29 Lotus Plaza, Sector 18",
            "city": "Noida",
            "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
            "rating": 4.5,
            "review_count": 140,
            "opening_hours": "12:00 PM - 10:30 PM",
            "is_available": True,
            "delivery_time": "35-45 mins",
            "delivery_fee": 45.0,
            "created_at": "2026-01-18 14:00:00"
        }
    ]
    await restaurants_col.insert_many(restaurants)
    print("[SUCCESS] Restaurants seeded")

    # 4. Menu Items
    menu_items = [
        # Spice Garden
        {
            "_id": "m1",
            "restaurant_id": "r1",
            "category_id": "c1",
            "name": "Paneer Butter Masala",
            "description": "Fresh cottage cheese cubes simmered in a silky tomato and cashew butter gravy.",
            "price": 320.0,
            "discount": 10.0,
            "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
            "is_veg": True,
            "is_available": True,
            "preparation_time": "20 mins",
            "rating": 4.9,
            "review_count": 120,
            "is_popular": True
        },
        {
            "_id": "m2",
            "restaurant_id": "r1",
            "category_id": "c1",
            "name": "Butter Garlic Naan",
            "description": "Soft leavened flatbread brushed with garlic butter and herbs.",
            "price": 65.0,
            "discount": 0.0,
            "image": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500",
            "is_veg": True,
            "is_available": True,
            "preparation_time": "10 mins",
            "rating": 4.8,
            "review_count": 210,
            "is_popular": True
        },
        {
            "_id": "m3",
            "restaurant_id": "r1",
            "category_id": "c5",
            "name": "Royal Hyderabadi Chicken Biryani",
            "description": "Fragrant basmati rice layered with marinated chicken and aromatic spices.",
            "price": 399.0,
            "discount": 15.0,
            "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
            "is_veg": False,
            "is_available": True,
            "preparation_time": "25 mins",
            "rating": 4.9,
            "review_count": 340,
            "is_popular": True
        },

        # Bella Italia
        {
            "_id": "m4",
            "restaurant_id": "r2",
            "category_id": "c2",
            "name": "Classic Margherita Pizza (12\")",
            "description": "San Marzano tomato sauce, fresh mozzarella, and fresh basil leaves.",
            "price": 450.0,
            "discount": 20.0,
            "image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500",
            "is_veg": True,
            "is_available": True,
            "preparation_time": "25 mins",
            "rating": 4.7,
            "review_count": 95,
            "is_popular": True
        },
        {
            "_id": "m5",
            "restaurant_id": "r2",
            "category_id": "c2",
            "name": "Pepperoni Feast Pizza",
            "description": "Double spicy pepperoni, mozzarella, and chili oil drizzle.",
            "price": 580.0,
            "discount": 10.0,
            "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
            "is_veg": False,
            "is_available": True,
            "preparation_time": "25 mins",
            "rating": 4.8,
            "review_count": 150,
            "is_popular": True
        },

        # Burger Craft
        {
            "_id": "m6",
            "restaurant_id": "r3",
            "category_id": "c3",
            "name": "Double Smash Cheeseburger",
            "description": "Two crispy beef patties, cheddar cheese, caramelized onions, house sauce.",
            "price": 299.0,
            "discount": 10.0,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
            "is_veg": False,
            "is_available": True,
            "preparation_time": "15 mins",
            "rating": 4.6,
            "review_count": 180,
            "is_popular": True
        },
        {
            "_id": "m7",
            "restaurant_id": "r3",
            "category_id": "c6",
            "name": "Belgian Chocolate Shake",
            "description": "Thick creamy shake made with rich Belgian dark chocolate.",
            "price": 180.0,
            "discount": 0.0,
            "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500",
            "is_veg": True,
            "is_available": True,
            "preparation_time": "10 mins",
            "rating": 4.9,
            "review_count": 88,
            "is_popular": False
        },

        # Dragon Wok
        {
            "_id": "m8",
            "restaurant_id": "r4",
            "category_id": "c4",
            "name": "Veg Hakka Noodles",
            "description": "Wok-tossed noodles with crunchy bell peppers, cabbage and spring onions.",
            "price": 240.0,
            "discount": 5.0,
            "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500",
            "is_veg": True,
            "is_available": True,
            "preparation_time": "15 mins",
            "rating": 4.5,
            "review_count": 76,
            "is_popular": True
        }
    ]
    await menu_col.insert_many(menu_items)
    print("[SUCCESS] Menu Items seeded")

    # 5. Coupons
    coupons = [
        {"_id": "cp1", "code": "QUICK50", "discount_percentage": 50.0, "max_discount_amount": 100.0, "min_order_amount": 199.0, "is_active": True, "valid_until": "2026-12-31"},
        {"_id": "cp2", "code": "WELCOME100", "discount_percentage": 25.0, "max_discount_amount": 150.0, "min_order_amount": 399.0, "is_active": True, "valid_until": "2026-12-31"},
        {"_id": "cp3", "code": "FREEDEL", "discount_percentage": 10.0, "max_discount_amount": 40.0, "min_order_amount": 149.0, "is_active": True, "valid_until": "2026-12-31"},
    ]
    await coupons_col.insert_many(coupons)
    print("[SUCCESS] Coupons seeded")

    # 6. Sample Reviews
    reviews = [
        {"_id": "rev1", "restaurant_id": "r1", "user_id": "customer_1", "user_name": "Alex Johnson", "user_avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "rating": 5.0, "comment": "The Paneer Butter Masala was heavenly! Quick delivery and piping hot food.", "created_at": "2026-02-01 19:30:00"},
        {"_id": "rev2", "restaurant_id": "r2", "user_id": "customer_1", "user_name": "Alex Johnson", "user_avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "rating": 4.5, "comment": "Best crust in town! Margherita pizza felt truly authentic.", "created_at": "2026-02-03 21:00:00"}
    ]
    await reviews_col.insert_many(reviews)
    print("[SUCCESS] Reviews seeded")

    # 7. Sample Orders
    orders = [
        {
            "_id": "ord1001",
            "customer_id": "customer_1",
            "customer_name": "Alex Johnson",
            "customer_email": "john@quickbite.com",
            "restaurant_id": "r1",
            "restaurant_name": "Spice Garden Fine Dining",
            "items": [
                {"menu_item_id": "m1", "name": "Paneer Butter Masala", "price": 320.0, "quantity": 1, "total_price": 288.0},
                {"menu_item_id": "m2", "name": "Butter Garlic Naan", "price": 65.0, "quantity": 2, "total_price": 130.0}
            ],
            "subtotal": 418.0,
            "gst": 20.9,
            "delivery_charge": 35.0,
            "discount": 50.0,
            "grand_total": 423.9,
            "status": "Delivered",
            "payment_method": "upi",
            "payment_status": "Paid",
            "delivery_address": "Flat 402, Sunshine Apartments, MG Road, Bengaluru",
            "phone": "+91 9876543210",
            "order_notes": "Please keep it mildly spicy.",
            "created_at": "2026-02-05 13:15:00",
            "updated_at": "2026-02-05 13:45:00"
        }
    ]
    await orders_col.insert_many(orders)
    print("[SUCCESS] Sample Orders seeded")
    print("[COMPLETED] QuickBite Database Seeding Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
