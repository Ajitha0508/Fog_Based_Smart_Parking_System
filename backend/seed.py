import os
import sys
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import User, ParkingSlot, Reservation, QRLog, FogLog
from app.auth import get_password_hash
from app.services.qr_service import generate_secure_token

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@smartparking.com").first():
            print("Database already contains seed data. Resetting or updating...")
            # We can clear and reseed for a crisp clean state
            db.query(QRLog).delete()
            db.query(FogLog).delete()
            db.query(Reservation).delete()
            db.query(ParkingSlot).delete()
            db.query(User).delete()
            db.commit()

        print("Seeding Users...")
        default_pwd_hash = get_password_hash("Password123!")

        admin_user = User(
            name="System Administrator",
            email="admin@smartparking.com",
            phone="+1 555-0199",
            password_hash=default_pwd_hash,
            role="ADMIN",
            vehicle_number="KA-01-AD-9999",
            is_active=True,
            created_at=datetime.now() - timedelta(days=30)
        )

        staff_user = User(
            name="Security Gate Staff",
            email="staff@smartparking.com",
            phone="+1 555-0188",
            password_hash=default_pwd_hash,
            role="STAFF",
            vehicle_number="KA-01-ST-8888",
            is_active=True,
            created_at=datetime.now() - timedelta(days=20)
        )

        regular_user = User(
            name="Alex Rivera",
            email="user@smartparking.com",
            phone="+1 555-0177",
            password_hash=default_pwd_hash,
            role="USER",
            vehicle_number="KA-01-AB-1234",
            is_active=True,
            created_at=datetime.now() - timedelta(days=10)
        )

        user_2 = User(
            name="Sarah Connor",
            email="sarah@smartparking.com",
            phone="+1 555-0166",
            password_hash=default_pwd_hash,
            role="USER",
            vehicle_number="KA-05-EV-5678",
            is_active=True,
            created_at=datetime.now() - timedelta(days=5)
        )

        db.add_all([admin_user, staff_user, regular_user, user_2])
        db.commit()
        db.refresh(admin_user)
        db.refresh(staff_user)
        db.refresh(regular_user)
        db.refresh(user_2)

        print("Seeding 30 Parking Slots...")
        slots = []

        # Floor 1 - Zone A: 10 Car slots (A01 - A10)
        for i in range(1, 11):
            code = f"A{i:02d}"
            # Let A03 be OCCUPIED demo, A05 be MAINTENANCE demo
            status = "AVAILABLE"
            if code == "A03":
                status = "OCCUPIED"
            elif code == "A05":
                status = "MAINTENANCE"
            
            slots.append(ParkingSlot(
                slot_code=code,
                floor="Floor 1",
                zone="Zone A",
                vehicle_type="Car",
                status=status,
                is_active=True
            ))

        # Floor 1 - Zone B: 10 Bike slots (B01 - B10)
        for i in range(1, 11):
            code = f"B{i:02d}"
            status = "AVAILABLE"
            if code == "B02":
                status = "RESERVED"
            elif code == "B04":
                status = "OCCUPIED"

            slots.append(ParkingSlot(
                slot_code=code,
                floor="Floor 1",
                zone="Zone B",
                vehicle_type="Bike",
                status=status,
                is_active=True
            ))

        # Floor 2 - Zone C: 10 EV slots (C01 - C10)
        for i in range(1, 11):
            code = f"C{i:02d}"
            status = "AVAILABLE"
            if code == "C01":
                status = "RESERVED"

            slots.append(ParkingSlot(
                slot_code=code,
                floor="Floor 2",
                zone="Zone C",
                vehicle_type="EV",
                status=status,
                is_active=True
            ))

        db.add_all(slots)
        db.commit()

        # Retrieve slots for reference
        slot_map = {s.slot_code: s for s in db.query(ParkingSlot).all()}

        print("Seeding Sample Reservations...")
        now = datetime.now()

        # Reservation 1: Active RESERVED for user Alex Rivera (Slot C01)
        res_active = Reservation(
            reservation_code="RES-20260924-001",
            user_id=regular_user.id,
            slot_id=slot_map["C01"].id,
            vehicle_number="KA-01-AB-1234",
            vehicle_type="EV",
            booking_time=now - timedelta(minutes=45),
            entry_time=now + timedelta(minutes=15),
            expected_exit_time=now + timedelta(hours=3),
            status="CONFIRMED",
            qr_token=generate_secure_token(),
            created_at=now - timedelta(minutes=45)
        )

        # Reservation 2: Currently OCCUPIED for Sarah Connor (Slot A03)
        res_occupied = Reservation(
            reservation_code="RES-20260924-002",
            user_id=user_2.id,
            slot_id=slot_map["A03"].id,
            vehicle_number="KA-05-EV-5678",
            vehicle_type="Car",
            booking_time=now - timedelta(hours=2),
            entry_time=now - timedelta(hours=1, minutes=45),
            expected_exit_time=now + timedelta(hours=2),
            actual_entry_time=now - timedelta(hours=1, minutes=40),
            status="USED",
            qr_token=generate_secure_token(),
            created_at=now - timedelta(hours=2)
        )

        # Reservation 3: Past completed reservation for Alex Rivera (Slot A02)
        res_completed = Reservation(
            reservation_code="RES-20260923-005",
            user_id=regular_user.id,
            slot_id=slot_map["A02"].id,
            vehicle_number="KA-01-AB-1234",
            vehicle_type="Car",
            booking_time=now - timedelta(days=1, hours=4),
            entry_time=now - timedelta(days=1, hours=3),
            expected_exit_time=now - timedelta(days=1, hours=1),
            actual_entry_time=now - timedelta(days=1, hours=2, minutes=55),
            actual_exit_time=now - timedelta(days=1, hours=1, minutes=10),
            status="COMPLETED",
            qr_token=generate_secure_token(),
            created_at=now - timedelta(days=1, hours=4)
        )

        # Reservation 4: Cancelled reservation
        res_cancelled = Reservation(
            reservation_code="RES-20260922-003",
            user_id=regular_user.id,
            slot_id=slot_map["A04"].id,
            vehicle_number="KA-01-AB-1234",
            vehicle_type="Car",
            booking_time=now - timedelta(days=2),
            entry_time=now - timedelta(days=2, hours=-2),
            expected_exit_time=now - timedelta(days=2, hours=-5),
            status="CANCELLED",
            qr_token=generate_secure_token(),
            created_at=now - timedelta(days=2)
        )

        db.add_all([res_active, res_occupied, res_completed, res_cancelled])
        db.commit()
        db.refresh(res_occupied)
        db.refresh(res_completed)

        print("Seeding QR Logs and Fog Node Audit Events...")
        # QR Log 1: Success entry for A03
        qr_log1 = QRLog(
            reservation_id=res_occupied.id,
            slot_id=slot_map["A03"].id,
            vehicle_number=res_occupied.vehicle_number,
            verification_status="VALID",
            action="ENTRY_ALLOWED",
            fog_node="FOG-NODE-GATEWAY-01",
            timestamp=now - timedelta(hours=1, minutes=40),
            details="Validated at North Gate Terminal Fog Node. Entry granted."
        )

        # QR Log 2: Success entry for past completed A02
        qr_log2 = QRLog(
            reservation_id=res_completed.id,
            slot_id=slot_map["A02"].id,
            vehicle_number=res_completed.vehicle_number,
            verification_status="VALID",
            action="ENTRY_ALLOWED",
            fog_node="FOG-NODE-GATEWAY-01",
            timestamp=now - timedelta(days=1, hours=2, minutes=55),
            details="Validated at North Gate Terminal Fog Node. Entry granted."
        )

        # QR Log 3: Rejected attempt (Invalid token)
        qr_log3 = QRLog(
            reservation_id=None,
            slot_id=None,
            vehicle_number="MH-12-XX-9999",
            verification_status="INVALID",
            action="ENTRY_DENIED",
            fog_node="FOG-NODE-GATEWAY-01",
            timestamp=now - timedelta(hours=3),
            details="QR token was not found in the reservation registry"
        )

        # QR Log 4: Rejected attempt (Vehicle number mismatch)
        qr_log4 = QRLog(
            reservation_id=res_active.id,
            slot_id=slot_map["C01"].id,
            vehicle_number="DL-03-ZZ-1111",
            verification_status="VEHICLE_MISMATCH",
            action="ENTRY_DENIED",
            fog_node="FOG-NODE-GATEWAY-01",
            timestamp=now - timedelta(minutes=30),
            details="Scanned vehicle DL-03-ZZ-1111 does not match registered vehicle KA-01-AB-1234"
        )

        db.add_all([qr_log1, qr_log2, qr_log3, qr_log4])

        # Fog Logs
        fog_logs = [
            FogLog(
                event_type="QR_RECEIVED",
                message="Received QR token for evaluation at edge node FOG-NODE-GATEWAY-01",
                processing_time=3.2,
                created_at=now - timedelta(hours=1, minutes=41),
                fog_node="FOG-NODE-GATEWAY-01"
            ),
            FogLog(
                event_type="LOCAL_VALIDATION",
                message=f"Reservation {res_occupied.reservation_code} token and vehicle verified locally.",
                processing_time=14.5,
                created_at=now - timedelta(hours=1, minutes=40),
                fog_node="FOG-NODE-GATEWAY-01"
            ),
            FogLog(
                event_type="ENTRY_ALLOWED",
                message=f"Vehicle {res_occupied.vehicle_number} permitted entry into Slot A03",
                processing_time=4.1,
                created_at=now - timedelta(hours=1, minutes=40),
                fog_node="FOG-NODE-GATEWAY-01"
            ),
            FogLog(
                event_type="SLOT_UPDATED",
                message="Slot A03 state changed to OCCUPIED.",
                processing_time=6.8,
                created_at=now - timedelta(hours=1, minutes=40),
                fog_node="FOG-NODE-GATEWAY-01"
            ),
            FogLog(
                event_type="CENTRAL_SYNC",
                message=f"Synchronized entry state for reservation {res_occupied.reservation_code} with central database.",
                processing_time=8.9,
                created_at=now - timedelta(hours=1, minutes=39),
                fog_node="FOG-NODE-GATEWAY-01"
            ),
            FogLog(
                event_type="ENTRY_DENIED",
                message="Local validation rejected: Scanned vehicle mismatch on Slot C01",
                processing_time=19.4,
                created_at=now - timedelta(minutes=30),
                fog_node="FOG-NODE-GATEWAY-01"
            )
        ]
        db.add_all(fog_logs)
        db.commit()

        print("\nSeed completed successfully!")
        print("--------------------------------------------------")
        print("Demo Accounts:")
        print("  Admin: admin@smartparking.com  / Password123!")
        print("  Staff: staff@smartparking.com  / Password123!")
        print("  User:  user@smartparking.com   / Password123!")
        print("  User2: sarah@smartparking.com  / Password123!")
        print("--------------------------------------------------")
        print(f"Total Slots: {len(slots)} (A01-A10, B01-B10, C01-C10)")
        print("Sample Reservations, QR Logs, and Fog Logs seeded.\n")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
