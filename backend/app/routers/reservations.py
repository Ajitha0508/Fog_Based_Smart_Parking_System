from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reservation, ParkingSlot, User
from app.schemas import ReservationCreate, ReservationResponse, ReservationCancelResponse
from app.auth import get_current_user, require_role
from app.services.parking_service import reserve_slot_atomic
from app.services.qr_service import generate_secure_token, generate_reservation_code
from app.services.fog_service import fog_service

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    res_in: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if res_in.entry_time >= res_in.expected_exit_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expected exit time must be after the entry time"
        )
    
    # Check if user already has an active reservation for this slot or vehicle
    active_conflict = db.query(Reservation).filter(
        Reservation.user_id == current_user.id,
        Reservation.status.in_(["CONFIRMED", "USED"]),
        Reservation.slot_id == res_in.slot_id
    ).first()
    if active_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active reservation for this parking slot."
        )

    # Atomic slot reservation check & lock
    slot = reserve_slot_atomic(db, res_in.slot_id)

    # Generate unique codes
    res_code = generate_reservation_code(db)
    qr_tok = generate_secure_token()

    reservation = Reservation(
        reservation_code=res_code,
        user_id=current_user.id,
        slot_id=slot.id,
        vehicle_number=res_in.vehicle_number.strip().upper(),
        vehicle_type=res_in.vehicle_type or slot.vehicle_type,
        booking_time=datetime.now(),
        entry_time=res_in.entry_time,
        expected_exit_time=res_in.expected_exit_time,
        status="CONFIRMED",
        qr_token=qr_tok,
        created_at=datetime.now()
    )

    db.add(reservation)
    
    # Log fog node reservation registry update
    fog_service._log_fog_event(
        db,
        event_type="SLOT_UPDATED",
        message=f"Slot {slot.slot_code} marked as RESERVED for booking {res_code}",
        processing_time=14.2
    )
    fog_service._log_fog_event(
        db,
        event_type="CENTRAL_SYNC",
        message=f"Synchronized new reservation {res_code} to edge cache",
        processing_time=8.5
    )

    db.commit()
    db.refresh(reservation)
    return reservation

@router.get("/my", response_model=List[ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Reservation).filter(
        Reservation.user_id == current_user.id
    ).order_by(Reservation.created_at.desc()).all()

@router.get("", response_model=List[ReservationResponse])
def get_all_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"]))
):
    return db.query(Reservation).order_by(Reservation.created_at.desc()).all()

@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    
    if current_user.role not in ["ADMIN", "STAFF"] and reservation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return reservation

@router.put("/{reservation_id}/cancel", response_model=ReservationCancelResponse)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    
    if current_user.role not in ["ADMIN"] and reservation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if reservation.status != "CONFIRMED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel reservation with status '{reservation.status}'. Only CONFIRMED reservations can be cancelled."
        )

    reservation.status = "CANCELLED"
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == reservation.slot_id).first()
    if slot and slot.status == "RESERVED":
        slot.status = "AVAILABLE"

    fog_service._log_fog_event(
        db,
        event_type="SLOT_UPDATED",
        message=f"Reservation {reservation.reservation_code} cancelled. Slot {slot.slot_code if slot else ''} reverted to AVAILABLE.",
        processing_time=12.1
    )
    fog_service._log_fog_event(
        db,
        event_type="CENTRAL_SYNC",
        message=f"Sync cancellation of {reservation.reservation_code} to edge node",
        processing_time=6.4
    )

    db.commit()

    return {
        "success": True,
        "message": f"Reservation {reservation.reservation_code} has been cancelled and slot released.",
        "reservation_id": reservation.id,
        "status": reservation.status
    }
