from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, ParkingSlot, Reservation, QRLog, FogLog
from app.schemas import DashboardStatsResponse, AnalyticsResponse, UserResponse
from app.auth import require_role

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    total_slots = db.query(ParkingSlot).count()
    available_slots = db.query(ParkingSlot).filter(ParkingSlot.status == "AVAILABLE").count()
    reserved_slots = db.query(ParkingSlot).filter(ParkingSlot.status == "RESERVED").count()
    occupied_slots = db.query(ParkingSlot).filter(ParkingSlot.status == "OCCUPIED").count()
    maintenance_slots = db.query(ParkingSlot).filter(ParkingSlot.status == "MAINTENANCE").count()
    
    total_users = db.query(User).count()
    active_reservations = db.query(Reservation).filter(Reservation.status.in_(["CONFIRMED", "USED"])).count()
    
    total_qr_verifications = db.query(QRLog).count()
    rejected_attempts = db.query(QRLog).filter(QRLog.action == "ENTRY_DENIED").count()

    return {
        "total_slots": total_slots,
        "available_slots": available_slots,
        "reserved_slots": reserved_slots,
        "occupied_slots": occupied_slots,
        "maintenance_slots": maintenance_slots,
        "total_users": total_users,
        "active_reservations": active_reservations,
        "total_qr_verifications": total_qr_verifications,
        "rejected_attempts": rejected_attempts
    }

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    return db.query(User).order_by(User.id.asc()).all()

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    # 1. Occupancy breakdown
    avail = db.query(ParkingSlot).filter(ParkingSlot.status == "AVAILABLE").count()
    resv = db.query(ParkingSlot).filter(ParkingSlot.status == "RESERVED").count()
    occ = db.query(ParkingSlot).filter(ParkingSlot.status == "OCCUPIED").count()
    maint = db.query(ParkingSlot).filter(ParkingSlot.status == "MAINTENANCE").count()
    
    occupancy_breakdown = [
        {"name": "Available", "value": avail, "color": "#10b981"},
        {"name": "Reserved", "value": resv, "color": "#f59e0b"},
        {"name": "Occupied", "value": occ, "color": "#ef4444"},
        {"name": "Maintenance", "value": maint, "color": "#64748b"}
    ]

    # 2. Daily reservations for past 7 days
    daily_reservations = []
    today = datetime.now().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        start_dt = datetime(day.year, day.month, day.day, 0, 0, 0)
        end_dt = datetime(day.year, day.month, day.day, 23, 59, 59)
        c = db.query(Reservation).filter(Reservation.created_at >= start_dt, Reservation.created_at <= end_dt).count()
        daily_reservations.append({
            "date": day.strftime("%b %d"),
            "reservations": c
        })

    # 3. QR verification metrics
    allowed = db.query(QRLog).filter(QRLog.action == "ENTRY_ALLOWED").count()
    denied = db.query(QRLog).filter(QRLog.action == "ENTRY_DENIED").count()
    qr_verification_metrics = [
        {"name": "Allowed", "value": allowed, "color": "#10b981"},
        {"name": "Denied", "value": denied, "color": "#ef4444"}
    ]

    # 4. Zone occupancy breakdown
    zones = ["Zone A", "Zone B", "Zone C"]
    zone_occupancy = []
    for z in zones:
        total_z = db.query(ParkingSlot).filter(ParkingSlot.zone == z).count()
        occ_z = db.query(ParkingSlot).filter(ParkingSlot.zone == z, ParkingSlot.status == "OCCUPIED").count()
        res_z = db.query(ParkingSlot).filter(ParkingSlot.zone == z, ParkingSlot.status == "RESERVED").count()
        avail_z = db.query(ParkingSlot).filter(ParkingSlot.zone == z, ParkingSlot.status == "AVAILABLE").count()
        zone_occupancy.append({
            "zone": z,
            "total": total_z,
            "occupied": occ_z,
            "reserved": res_z,
            "available": avail_z
        })

    return {
        "occupancy_breakdown": occupancy_breakdown,
        "daily_reservations": daily_reservations,
        "qr_verification_metrics": qr_verification_metrics,
        "zone_occupancy": zone_occupancy
    }
