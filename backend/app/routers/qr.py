from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reservation, ParkingSlot, User
from app.schemas import QRDetailsResponse
from app.auth import get_current_user
from app.services.qr_service import create_qr_payload, generate_qr_image_base64

router = APIRouter(prefix="/qr", tags=["QR Code"])

@router.get("/{reservation_id}", response_model=QRDetailsResponse)
def get_qr_for_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    
    if current_user.role not in ["ADMIN", "STAFF"] and reservation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    slot = db.query(ParkingSlot).filter(ParkingSlot.id == reservation.slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")

    payload_str = create_qr_payload(reservation.reservation_code, reservation.qr_token)
    b64_image = generate_qr_image_base64(payload_str)

    return {
        "reservation_id": reservation.id,
        "reservation_code": reservation.reservation_code,
        "slot_id": slot.id,
        "slot_code": slot.slot_code,
        "floor": slot.floor,
        "zone": slot.zone,
        "vehicle_number": reservation.vehicle_number,
        "vehicle_type": reservation.vehicle_type,
        "entry_time": reservation.entry_time,
        "expected_exit_time": reservation.expected_exit_time,
        "status": reservation.status,
        "qr_token": reservation.qr_token,
        "qr_payload": payload_str,
        "qr_code_base64": b64_image
    }

@router.post("/generate", response_model=QRDetailsResponse)
def generate_qr(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_qr_for_reservation(reservation_id=reservation_id, db=db, current_user=current_user)
