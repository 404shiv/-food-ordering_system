import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

from app.config.settings import settings
from app.database.db import connect_to_mongo, close_mongo_connection, get_collection
from app.database.seed import seed_database
from app.middleware.error_handler import global_exception_handler, validation_exception_handler

from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.restaurant_routes import router as restaurant_router
from app.routes.category_routes import router as category_router
from app.routes.menu_routes import router as menu_router
from app.routes.cart_routes import router as cart_router
from app.routes.order_routes import router as order_router
from app.routes.review_routes import router as review_router
from app.routes.coupon_routes import router as coupon_router
from app.routes.favorite_routes import router as favorite_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.upload_routes import router as upload_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    # Check if database is empty, seed automatically if needed
    users_col = get_collection("users")
    count = await users_col.count_documents({})
    if count == 0:
        await seed_database()
    yield
    # Shutdown
    await close_mongo_connection()

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s %(message)s')
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Static Uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=v1)
app.include_router(user_router, prefix=v1)
app.include_router(restaurant_router, prefix=v1)
app.include_router(category_router, prefix=v1)
app.include_router(menu_router, prefix=v1)
app.include_router(cart_router, prefix=v1)
app.include_router(order_router, prefix=v1)
app.include_router(review_router, prefix=v1)
app.include_router(coupon_router, prefix=v1)
app.include_router(favorite_router, prefix=v1)
app.include_router(analytics_router, prefix=v1)
app.include_router(upload_router, prefix=v1)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Online",
        "docs": f"{settings.API_V1_STR}/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
