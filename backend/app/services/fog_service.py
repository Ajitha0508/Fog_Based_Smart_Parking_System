import time
import random
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.models import Reservation, ParkingSlot, QRLog, FogLog
from app.services.qr_service import parse_scanned_token

def _normalize_vehicle_number(num: Optional[str]) -> str:
    if not num:
        return ""
    return num.replace(" ", "").replace("-", "").upper()

class FogNodeService:
    def __init__(self, node_id: str = settings.FOG_NODE_ID):
        self.node_id = node_id

    def verify_and_process_qr(
        self,
        db: Session,
        raw_qr_input: str,
        scanned_vehicle_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulate edge fog node validation and database synchronization.
        1. Receive QR payload locally at the edge gateway.
        2. Validate reservation and token against local edge cache/rules.
        3. Check reservation status and vehicle number.
        4. Approve/Reject entry and update slot status.
        5. Record Fog and QR audit logs and synchronize with central database.
        """
        start_time = time.perf_counter()
        
        # 1. Parse payload (supports JSON payload or raw token)
        res_code_hint, token = parse_scanned_token(raw_qr_input)
        
        # Log edge event: QR received
        self._log_fog_event(
            db,
            event_type="QR_RECEIVED",
            message=f"Received QR token for evaluation at edge node {self.node_id}",
            processing_time=round(random.uniform(2.5, 5.0), 2)
        )

        # 2. Local validation: Find reservation
        reservation = None
        if token:
            reservation = db.query(Reservation).filter(Reservation.qr_token == token).first()
        
        if not reservation and res_code_hint:
            reservation = db.query(Reservation).filter(Reservation.reservation_code == res_code_hint).first()

        # Check: Token not found
        if not reservation:
            elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(10.0, 20.0), 2)
            self._log_qr_attempt(
                db,
                reservation_id=None,
                slot_id=None,
                vehicle_number=scanned_vehicle_number,
                verification_status="INVALID",
                action="ENTRY_DENIED",
                details="QR token was not found in the reservation registry"
            )
            self._log_fog_event(
                db,
                event_type="ENTRY_DENIED",
                message="Local validation failed: Unknown or tampered QR token",
                processing_time=elapsed
            )
            db.commit()
            return {
                "success": False,
                "message": "Invalid QR code: Token not recognized",
                "action": "ENTRY_DENIED",
                "processing_time_ms": elapsed,
                "fog_node": self.node_id
            }

        slot = db.query(ParkingSlot).filter(ParkingSlot.id == reservation.slot_id).first()
        now = datetime.now()

        # Check: Status is CANCELLED
        if reservation.status == "CANCELLED":
            elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(10.0, 20.0), 2)
            self._log_qr_attempt(
                db,
                reservation_id=reservation.id,
                slot_id=slot.id if slot else None,
                vehicle_number=reservation.vehicle_number,
                verification_status="CANCELLED",
                action="ENTRY_DENIED",
                details=f"Reservation {reservation.reservation_code} was previously cancelled"
            )
            self._log_fog_event(
                db,
                event_type="ENTRY_DENIED",
                message=f"Local validation rejected: Reservation {reservation.reservation_code} is cancelled",
                processing_time=elapsed
            )
            db.commit()
            return {
                "success": False,
                "message": "Entry denied: This reservation was cancelled",
                "action": "ENTRY_DENIED",
                "reservation_id": reservation.id,
                "reservation_code": reservation.reservation_code,
                "slot_id": slot.id if slot else None,
                "slot_code": slot.slot_code if slot else None,
                "vehicle_number": reservation.vehicle_number,
                "processing_time_ms": elapsed,
                "fog_node": self.node_id
            }

        # Check: Status is ALREADY USED or OCCUPIED
        if reservation.status in ["USED", "COMPLETED"]:
            elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(10.0, 20.0), 2)
            self._log_qr_attempt(
                db,
                reservation_id=reservation.id,
                slot_id=slot.id if slot else None,
                vehicle_number=reservation.vehicle_number,
                verification_status="ALREADY_USED",
                action="ENTRY_DENIED",
                details=f"QR token has already been consumed (status: {reservation.status})"
            )
            self._log_fog_event(
                db,
                event_type="ENTRY_DENIED",
                message=f"Local validation rejected: QR code already used for reservation {reservation.reservation_code}",
                processing_time=elapsed
            )
            db.commit()
            return {
                "success": False,
                "message": "QR code already used or completed",
                "action": "ENTRY_DENIED",
                "reservation_id": reservation.id,
                "reservation_code": reservation.reservation_code,
                "slot_id": slot.id if slot else None,
                "slot_code": slot.slot_code if slot else None,
                "vehicle_number": reservation.vehicle_number,
                "processing_time_ms": elapsed,
                "fog_node": self.node_id
            }

        # Check: EXPIRED
        if reservation.status == "EXPIRED" or (reservation.expected_exit_time and now > reservation.expected_exit_time):
            reservation.status = "EXPIRED"
            if slot and slot.status == "RESERVED":
                slot.status = "AVAILABLE"
            elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(10.0, 20.0), 2)
            self._log_qr_attempt(
                db,
                reservation_id=reservation.id,
                slot_id=slot.id if slot else None,
                vehicle_number=reservation.vehicle_number,
                verification_status="EXPIRED",
                action="ENTRY_DENIED",
                details=f"Reservation {reservation.reservation_code} has expired"
            )
            self._log_fog_event(
                db,
                event_type="ENTRY_DENIED",
                message=f"Local validation rejected: Expired reservation {reservation.reservation_code}",
                processing_time=elapsed
            )
            db.commit()
            return {
                "success": False,
                "message": "QR code has expired",
                "action": "ENTRY_DENIED",
                "reservation_id": reservation.id,
                "reservation_code": reservation.reservation_code,
                "slot_id": slot.id if slot else None,
                "slot_code": slot.slot_code if slot else None,
                "vehicle_number": reservation.vehicle_number,
                "processing_time_ms": elapsed,
                "fog_node": self.node_id
            }

        # Check: Slot maintenance
        if slot and (slot.status == "MAINTENANCE" or not slot.is_active):
            elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(10.0, 20.0), 2)
            self._log_qr_attempt(
                db,
                reservation_id=reservation.id,
                slot_id=slot.id,
                vehicle_number=reservation.vehicle_number,
                verification_status="SLOT_UNAVAILABLE",
                action="ENTRY_DENIED",
                details=f"Assigned slot {slot.slot_code} is under maintenance"
            )
            db.commit()
            return {
                "success": False,
                "message": f"Slot {slot.slot_code} is currently under maintenance or inactive",
                "action": "ENTRY_DENIED",
                "reservation_id": reservation.id,
                "reservation_code": reservation.reservation_code,
                "slot_id": slot.id,
                "slot_code": slot.slot_code,
                "processing_time_ms": elapsed,
                "fog_node": self.node_id
            }

        # Check: Scanned vehicle number mismatch (if provided)
        if scanned_vehicle_number:
            norm_scanned = _normalize_vehicle_number(scanned_vehicle_number)
            norm_res = _normalize_vehicle_number(reservation.vehicle_number)
            if norm_scanned != norm_res:
                elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(10.0, 20.0), 2)
                self._log_qr_attempt(
                    db,
                    reservation_id=reservation.id,
                    slot_id=slot.id if slot else None,
                    vehicle_number=scanned_vehicle_number,
                    verification_status="VEHICLE_MISMATCH",
                    action="ENTRY_DENIED",
                    details=f"Expected {reservation.vehicle_number}, scanned {scanned_vehicle_number}"
                )
                self._log_fog_event(
                    db,
                    event_type="ENTRY_DENIED",
                    message=f"Vehicle mismatch: scanned {scanned_vehicle_number} != registered {reservation.vehicle_number}",
                    processing_time=elapsed
                )
                db.commit()
                return {
                    "success": False,
                    "message": f"Vehicle number does not match reservation (Expected {reservation.vehicle_number})",
                    "action": "ENTRY_DENIED",
                    "reservation_id": reservation.id,
                    "reservation_code": reservation.reservation_code,
                    "slot_id": slot.id if slot else None,
                    "slot_code": slot.slot_code if slot else None,
                    "vehicle_number": reservation.vehicle_number,
                    "processing_time_ms": elapsed,
                    "fog_node": self.node_id
                }

        # VALIDATION SUCCESS!
        # Step 4: Update status
        if slot:
            slot.status = "OCCUPIED"
        reservation.status = "USED"
        reservation.actual_entry_time = now

        elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(12.0, 28.0), 2)

        # Step 5: Edge & central logging
        self._log_qr_attempt(
            db,
            reservation_id=reservation.id,
            slot_id=slot.id if slot else None,
            vehicle_number=reservation.vehicle_number,
            verification_status="VALID",
            action="ENTRY_ALLOWED",
            details=f"Verified at Fog Node {self.node_id}. Entry granted to slot {slot.slot_code if slot else 'N/A'}"
        )

        self._log_fog_event(
            db,
            event_type="LOCAL_VALIDATION",
            message=f"Reservation {reservation.reservation_code} token and vehicle verified locally.",
            processing_time=round(elapsed * 0.4, 2)
        )
        self._log_fog_event(
            db,
            event_type="SLOT_UPDATED",
            message=f"Slot {slot.slot_code if slot else 'N/A'} state changed to OCCUPIED.",
            processing_time=round(elapsed * 0.3, 2)
        )
        self._log_fog_event(
            db,
            event_type="CENTRAL_SYNC",
            message=f"Synchronized entry state for reservation {reservation.reservation_code} with central database.",
            processing_time=round(elapsed * 0.3, 2)
        )

        db.commit()

        return {
            "success": True,
            "message": "QR verified successfully! Vehicle allowed entry.",
            "action": "ENTRY_ALLOWED",
            "reservation_id": reservation.id,
            "reservation_code": reservation.reservation_code,
            "slot_id": slot.id if slot else None,
            "slot_code": slot.slot_code if slot else None,
            "vehicle_number": reservation.vehicle_number,
            "processing_time_ms": elapsed,
            "fog_node": self.node_id
        }

    def process_vehicle_exit(
        self,
        db: Session,
        slot_id: Optional[int] = None,
        reservation_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Handle vehicle departure:
        Slot transitions from OCCUPIED to AVAILABLE.
        Active reservation transitions to COMPLETED.
        """
        start_time = time.perf_counter()
        
        slot = None
        reservation = None

        if slot_id:
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
            if slot:
                reservation = db.query(Reservation).filter(
                    Reservation.slot_id == slot.id,
                    Reservation.status == "USED"
                ).order_by(Reservation.id.desc()).first()

        if not slot and reservation_id:
            reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
            if reservation:
                slot = db.query(ParkingSlot).filter(ParkingSlot.id == reservation.slot_id).first()

        if not slot:
            return {"success": False, "message": "Parking slot not found", "slot_id": 0, "slot_code": ""}

        now = datetime.now()
        slot.status = "AVAILABLE"

        if reservation:
            reservation.status = "COMPLETED"
            reservation.actual_exit_time = now

        elapsed = round((time.perf_counter() - start_time) * 1000 + random.uniform(8.0, 18.0), 2)

        self._log_fog_event(
            db,
            event_type="VEHICLE_EXIT",
            message=f"Vehicle exited slot {slot.slot_code}. Slot status reset to AVAILABLE.",
            processing_time=elapsed
        )
        self._log_fog_event(
            db,
            event_type="CENTRAL_SYNC",
            message=f"Synchronized exit state for slot {slot.slot_code} with central database.",
            processing_time=round(elapsed * 0.4, 2)
        )

        db.commit()

        return {
            "success": True,
            "message": f"Vehicle has exited. Slot {slot.slot_code} is now AVAILABLE.",
            "slot_id": slot.id,
            "slot_code": slot.slot_code,
            "reservation_id": reservation.id if reservation else None,
            "reservation_code": reservation.reservation_code if reservation else None,
            "exit_time": now
        }

    def get_fog_node_status(self, db: Session) -> Dict[str, Any]:
        total_requests = db.query(QRLog).count()
        successful_verifications = db.query(QRLog).filter(QRLog.action == "ENTRY_ALLOWED").count()
        rejected_verifications = db.query(QRLog).filter(QRLog.action == "ENTRY_DENIED").count()
        
        avg_time = db.query(func.avg(FogLog.processing_time)).scalar() or 22.4
        last_log = db.query(QRLog).order_by(QRLog.timestamp.desc()).first()
        recent_events = db.query(FogLog).order_by(FogLog.created_at.desc()).limit(15).all()

        return {
            "status": "ONLINE",
            "fog_node_id": self.node_id,
            "location": settings.FOG_LOCATION,
            "processing_mode": settings.FOG_PROCESSING_MODE,
            "total_requests": total_requests,
            "successful_verifications": successful_verifications,
            "rejected_verifications": rejected_verifications,
            "average_processing_time_ms": round(float(avg_time), 2),
            "last_verification_time": last_log.timestamp if last_log else None,
            "recent_events": recent_events
        }

    def _log_qr_attempt(
        self,
        db: Session,
        reservation_id: Optional[int],
        slot_id: Optional[int],
        vehicle_number: Optional[str],
        verification_status: str,
        action: str,
        details: str
    ):
        qr_log = QRLog(
            reservation_id=reservation_id,
            slot_id=slot_id,
            vehicle_number=vehicle_number,
            verification_status=verification_status,
            action=action,
            fog_node=self.node_id,
            timestamp=datetime.now(),
            details=details
        )
        db.add(qr_log)

    def _log_fog_event(self, db: Session, event_type: str, message: str, processing_time: float):
        fog_log = FogLog(
            event_type=event_type,
            message=message,
            processing_time=processing_time,
            created_at=datetime.now(),
            fog_node=self.node_id
        )
        db.add(fog_log)

fog_service = FogNodeService()
