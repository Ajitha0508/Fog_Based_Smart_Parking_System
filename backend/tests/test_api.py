import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import User, ParkingSlot, Reservation
from app.auth import get_password_hash

# Use in-memory SQLite for clean isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_smartparking.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test users
    pwd_hash = get_password_hash("TestPass123!")
    admin = User(name="Admin Tester", email="admin@test.com", phone="1234567890", password_hash=pwd_hash, role="ADMIN", is_active=True)
    staff = User(name="Staff Tester", email="staff@test.com", phone="1234567891", password_hash=pwd_hash, role="STAFF", is_active=True)
    user = User(name="User Tester", email="user@test.com", phone="1234567892", password_hash=pwd_hash, role="USER", is_active=True)
    
    # Create sample slots
    slot1 = ParkingSlot(slot_code="T01", floor="Floor 1", zone="Zone T", vehicle_type="Car", status="AVAILABLE", is_active=True)
    slot2 = ParkingSlot(slot_code="T02", floor="Floor 1", zone="Zone T", vehicle_type="Car", status="AVAILABLE", is_active=True)
    slot3 = ParkingSlot(slot_code="T03", floor="Floor 1", zone="Zone T", vehicle_type="Bike", status="MAINTENANCE", is_active=True)

    db.add_all([admin, staff, user, slot1, slot2, slot3])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def get_auth_token(email: str, password: str = "TestPass123!") -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def test_user_registration():
    res = client.post("/api/auth/register", json={
        "name": "New Registered",
        "email": "newreg@test.com",
        "phone": "9998887776",
        "password": "Password123!",
        "vehicle_number": "MH-01-AB-1234"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newreg@test.com"


def test_user_login():
    res = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": "TestPass123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_jwt_validation_and_me():
    token = get_auth_token("user@test.com")
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "user@test.com"


def test_slot_listing_and_creation():
    admin_token = get_auth_token("admin@test.com")
    # List slots
    res = client.get("/api/parking/slots")
    assert res.status_code == 200
    assert len(res.json()) >= 3

    # Admin create slot
    res = client.post("/api/parking/slots", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "slot_code": "T04",
        "floor": "Floor 1",
        "zone": "Zone T",
        "vehicle_type": "EV",
        "status": "AVAILABLE",
        "is_active": True
    })
    assert res.status_code == 201
    assert res.json()["slot_code"] == "T04"


def test_reservation_creation_and_duplicate_prevention():
    user_token = get_auth_token("user@test.com")
    
    # Fetch slot T01 id
    res_slots = client.get("/api/parking/slots?status=AVAILABLE")
    t01 = next(s for s in res_slots.json() if s["slot_code"] == "T01")
    slot_id = t01["id"]

    now = datetime.now()
    entry = (now + timedelta(hours=1)).isoformat()
    exit_time = (now + timedelta(hours=3)).isoformat()

    # Successful reservation
    res = client.post("/api/reservations", headers={"Authorization": f"Bearer {user_token}"}, json={
        "slot_id": slot_id,
        "vehicle_number": "KA-01-TST-1111",
        "vehicle_type": "Car",
        "entry_time": entry,
        "expected_exit_time": exit_time
    })
    assert res.status_code == 201
    res_data = res.json()
    assert res_data["status"] == "CONFIRMED"
    assert "RES-" in res_data["reservation_code"]
    assert res_data["qr_token"] is not None

    # Check slot status changed to RESERVED
    slot_res = client.get(f"/api/parking/slots/{slot_id}")
    assert slot_res.json()["status"] == "RESERVED"

    # Attempt duplicate reservation on same slot by another user
    other_token = get_auth_token("newreg@test.com", password="Password123!")
    res_dup = client.post("/api/reservations", headers={"Authorization": f"Bearer {other_token}"}, json={
        "slot_id": slot_id,
        "vehicle_number": "DL-02-DUP-2222",
        "vehicle_type": "Car",
        "entry_time": entry,
        "expected_exit_time": exit_time
    })
    assert res_dup.status_code == 409
    assert "already reserved" in res_dup.json()["detail"].lower()


def test_qr_generation_and_details():
    user_token = get_auth_token("user@test.com")
    my_res = client.get("/api/reservations/my", headers={"Authorization": f"Bearer {user_token}"})
    assert len(my_res.json()) > 0
    res_id = my_res.json()[0]["id"]

    res = client.get(f"/api/qr/{res_id}", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "qr_payload" in data
    assert "data:image/png;base64," in data["qr_code_base64"]


def test_fog_node_verification_valid_and_status_update():
    staff_token = get_auth_token("staff@test.com")
    user_token = get_auth_token("user@test.com")
    
    my_res = client.get("/api/reservations/my", headers={"Authorization": f"Bearer {user_token}"})
    reservation = my_res.json()[0]
    token = reservation["qr_token"]
    veh_num = reservation["vehicle_number"]
    slot_id = reservation["slot_id"]

    # Verify through Fog Node
    fog_res = client.post("/api/fog/verify-qr", headers={"Authorization": f"Bearer {staff_token}"}, json={
        "qr_token": token,
        "scanned_vehicle_number": veh_num
    })
    assert fog_res.status_code == 200
    f_data = fog_res.json()
    assert f_data["success"] is True
    assert f_data["action"] == "ENTRY_ALLOWED"
    assert f_data["fog_node"] == "FOG-NODE-GATEWAY-01"
    assert f_data["processing_time_ms"] > 0

    # Verify slot became OCCUPIED
    slot_check = client.get(f"/api/parking/slots/{slot_id}")
    assert slot_check.json()["status"] == "OCCUPIED"


def test_fog_node_verification_used_and_invalid():
    staff_token = get_auth_token("staff@test.com")
    user_token = get_auth_token("user@test.com")
    
    my_res = client.get("/api/reservations/my", headers={"Authorization": f"Bearer {user_token}"})
    reservation = my_res.json()[0]
    token = reservation["qr_token"]

    # Re-scan used QR token -> should be DENIED
    used_res = client.post("/api/fog/verify-qr", headers={"Authorization": f"Bearer {staff_token}"}, json={
        "qr_token": token
    })
    assert used_res.status_code == 200
    assert used_res.json()["success"] is False
    assert used_res.json()["action"] == "ENTRY_DENIED"

    # Completely invalid token -> should be DENIED
    invalid_res = client.post("/api/fog/verify-qr", headers={"Authorization": f"Bearer {staff_token}"}, json={
        "qr_token": "non-existent-random-token-xyz"
    })
    assert invalid_res.status_code == 200
    assert invalid_res.json()["success"] is False
    assert invalid_res.json()["action"] == "ENTRY_DENIED"


def test_vehicle_exit_and_vacancy_restoration():
    staff_token = get_auth_token("staff@test.com")
    user_token = get_auth_token("user@test.com")
    
    my_res = client.get("/api/reservations/my", headers={"Authorization": f"Bearer {user_token}"})
    reservation = my_res.json()[0]
    slot_id = reservation["slot_id"]

    # Process vehicle departure
    exit_res = client.post("/api/fog/vehicle-exit", headers={"Authorization": f"Bearer {staff_token}"}, json={
        "slot_id": slot_id
    })
    assert exit_res.status_code == 200
    assert exit_res.json()["success"] is True

    # Check slot is now AVAILABLE again
    slot_check = client.get(f"/api/parking/slots/{slot_id}")
    assert slot_check.json()["status"] == "AVAILABLE"


def test_fog_status_and_logs():
    admin_token = get_auth_token("admin@test.com")
    
    status_res = client.get("/api/fog/status", headers={"Authorization": f"Bearer {admin_token}"})
    assert status_res.status_code == 200
    s_data = status_res.json()
    assert s_data["status"] == "ONLINE"
    assert s_data["total_requests"] > 0

    logs_res = client.get("/api/fog/logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert logs_res.status_code == 200
    assert len(logs_res.json()) > 0
