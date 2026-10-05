from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ParkingSlot, User
from app.schemas import SlotResponse, SlotCreate, SlotUpdate
from app.auth import get_current_user, require_role
from app.services.parking_service import get_all_slots

router = APIRouter(prefix="/parking", tags=["Parking Slots"])

@router.get("/slots", response_model=List[SlotResponse])
def list_slots(
    floor: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Retrieve parking slots with optional filtering by floor, zone, vehicle type, or status."""
    return get_all_slots(
        db=db,
        floor=floor,
        zone=zone,
        vehicle_type=vehicle_type,
        status_filter=status,
        active_only=active_only
    )

@router.get("/slots/{slot_id}", response_model=SlotResponse)
def get_slot(slot_id: int, db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parking slot not found")
    return slot

@router.post("/slots", response_model=SlotResponse, status_code=status.HTTP_201_CREATED)
def create_slot(
    slot_in: SlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    existing = db.query(ParkingSlot).filter(ParkingSlot.slot_code == slot_in.slot_code.upper()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Slot code {slot_in.slot_code} already exists")
    
    slot = ParkingSlot(
        slot_code=slot_in.slot_code.upper(),
        floor=slot_in.floor,
        zone=slot_in.zone,
        vehicle_type=slot_in.vehicle_type,
        status=slot_in.status or "AVAILABLE",
        is_active=slot_in.is_active
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@router.put("/slots/{slot_id}", response_model=SlotResponse)
def update_slot(
    slot_id: int,
    slot_update: SlotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"]))
):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parking slot not found")
    
    if slot_update.slot_code is not None:
        slot.slot_code = slot_update.slot_code.upper()
    if slot_update.floor is not None:
        slot.floor = slot_update.floor
    if slot_update.zone is not None:
        slot.zone = slot_update.zone
    if slot_update.vehicle_type is not None:
        slot.vehicle_type = slot_update.vehicle_type
    if slot_update.status is not None:
        slot.status = slot_update.status
    if slot_update.is_active is not None and current_user.role == "ADMIN":
        slot.is_active = slot_update.is_active

    db.commit()
    db.refresh(slot)
    return slot

@router.delete("/slots/{slot_id}", status_code=status.HTTP_200_OK)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parking slot not found")
    
    # Check if there are active reservations or occupied state
    if slot.status in ["RESERVED", "OCCUPIED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete slot {slot.slot_code} while it is {slot.status}. Free or vacate it first."
        )

    db.delete(slot)
    db.commit()
    return {"success": True, "message": f"Parking slot {slot.slot_code} deleted successfully"}
