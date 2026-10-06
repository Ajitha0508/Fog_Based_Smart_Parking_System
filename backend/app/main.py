import sys
import os
from contextlib import asynccontextmanager

# Ensure backend root is always on sys.path regardless of execution directory
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, users, parking, reservations, qr, fog, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure database schema is created and initial seed data exists on deployment."""
    Base.metadata.create_all(bind=engine)
    from app.models import User
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("[INFO] Database is empty. Seeding initial users and parking slots for deployment...")
            try:
                from seed import seed_database
                seed_database()
            except ImportError:
                from backend.seed import seed_database
                seed_database()
            print("[INFO] Initial deployment seeding completed successfully!")
    except Exception as e:
        print(f"[WARNING] Database seed check encountered: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="Fog Computing-Based Intelligent Parking Management System",
    description="""
    ## Intelligent Parking Management with Edge Fog Computing and Secure QR Authentication
    
    This backend provides:
    * **Role-Based Authentication**: Secure JWT tokens for USER, PARKING STAFF, and ADMIN.
    * **Parking Slot Management**: Real-time slot status (AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE).
    * **Secure Reservation Workflow**: Anti-collision slot booking, encrypted QR tokens, and life-cycle states.
    * **Simulated Edge Fog Node**: Local verification gateway with realistic edge processing time, state transition, and cloud synchronization.
    * **Exit Management**: Immediate departure processing and vacancy restoration.
    * **Audit & Analytics**: Complete QR access logs, Fog event streams, and real-time dashboard telemetry.
    """,
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend execution and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(parking.router, prefix=settings.API_V1_STR)
app.include_router(reservations.router, prefix=settings.API_V1_STR)
app.include_router(qr.router, prefix=settings.API_V1_STR)
app.include_router(fog.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "fog_node": settings.FOG_NODE_ID,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "fog_edge_gateway": "online"
    }
