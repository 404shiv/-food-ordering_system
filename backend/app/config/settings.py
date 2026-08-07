import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuickBite Food Ordering API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server settings
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "quickbite"
    
    # JWT
    SECRET_KEY: str = "quickbite_super_secret_jwt_key_2026_production_viva_grade"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Financial defaults
    GST_PERCENTAGE: float = 5.0
    DEFAULT_DELIVERY_CHARGE: float = 40.0
    FREE_DELIVERY_THRESHOLD: float = 500.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
