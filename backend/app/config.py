import os

class Settings:
    PROJECT_NAME: str = "Smart Parking System with Fog Computing"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartparking-fog-super-secret-key-2026-production-token")
    ALGORITHM: str = "HS256"
    # Long-lived persistent session: 30 days so users/staff/admin don't get asked again and again
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    
    # Handle both SQLite and PostgreSQL (Render provides postgres:// which SQLAlchemy 2.0 needs as postgresql://)
    _db_url = os.getenv("DATABASE_URL", "sqlite:///./smartparking.db")
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL: str = _db_url
    
    # Fog Computing Node Configuration
    FOG_NODE_ID: str = os.getenv("FOG_NODE_ID", "FOG-NODE-GATEWAY-01")
    FOG_LOCATION: str = os.getenv("FOG_LOCATION", "Terminal North Gateway - Local Zone")
    FOG_PROCESSING_MODE: str = "LOCAL_EDGE_VALIDATION"

settings = Settings()
