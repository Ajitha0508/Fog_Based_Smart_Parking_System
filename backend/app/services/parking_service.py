from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import ParkingSlot, Reservation

def get_all_slots(
    db: Session,
    floor: Optional[str] = None,
    zone: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    active_only: bool = False
) -> List[ParkingSlot]:
    query = db.query(ParkingSlot)
    if active_only:
        query = query.filter(ParkingSlot.is_active == True)
    if floor:
        query = query.filter(ParkingSlot.floor == floor)
    if zone:
        query = query.filter(ParkingSlot.zone == zone)
    if vehicle_type:
        query = query.filter(ParkingSlot.vehicle_type == vehicle_type)
    if status_filter:
        query = query.filter(ParkingSlot.status == status_filter)
    return query.order_by(ParkingSlot.slot_code.asc()).all()

def reserve_slot_atomic(db: Session, slot_id: int) -> ParkingSlot:
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).with_for_update().first() if hasattr(db.query(ParkingSlot), "with_for_update") else db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parking slot not found")
    if not slot.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parking slot is inactive")
    if slot.status == "MAINTENANCE":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slot is currently under maintenance")
    if slot.status != "AVAILABLE":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Slot {slot.slot_code} is already {slot.status.lower()}! Please select another slot.")
    
    # Mark slot as RESERVED
    slot.status = "RESERVED"
    return slot
