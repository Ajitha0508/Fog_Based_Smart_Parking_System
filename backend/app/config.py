import os

class Settings:
    PROJECT_NAME: str = "Smart Parking System with Fog Computing"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartparking-fog-super-secret-key-2026-production-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartparking.db")
    
    # Fog Computing Node Configuration
    FOG_NODE_ID: str = os.getenv("FOG_NODE_ID", "FOG-NODE-GATEWAY-01")
    FOG_LOCATION: str = os.getenv("FOG_LOCATION", "Terminal North Gateway - Local Zone")
    FOG_PROCESSING_MODE: str = "LOCAL_EDGE_VALIDATION"

settings = Settings()
