from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER", nullable=False)  # USER, STAFF, ADMIN
    vehicle_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")


class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_code = Column(String(20), unique=True, index=True, nullable=False)
    floor = Column(String(30), nullable=False)
    zone = Column(String(30), nullable=False)
    vehicle_type = Column(String(20), nullable=False)  # Car, Bike, EV
    status = Column(String(20), default="AVAILABLE", nullable=False)  # AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE
    is_active = Column(Boolean, default=True, nullable=False)

    reservations = relationship("Reservation", back_populates="slot")
    qr_logs = relationship("QRLog", back_populates="slot")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    reservation_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    slot_id = Column(Integer, ForeignKey("parking_slots.id", ondelete="CASCADE"), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    vehicle_type = Column(String(20), nullable=False)
    booking_time = Column(DateTime, default=datetime.now, nullable=False)
    entry_time = Column(DateTime, nullable=False)
    expected_exit_time = Column(DateTime, nullable=False)
    actual_entry_time = Column(DateTime, nullable=True)
    actual_exit_time = Column(DateTime, nullable=True)
    status = Column(String(20), default="CONFIRMED", nullable=False)  # CONFIRMED, USED, CANCELLED, EXPIRED, COMPLETED
    qr_token = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    user = relationship("User", back_populates="reservations")
    slot = relationship("ParkingSlot", back_populates="reservations")
    qr_logs = relationship("QRLog", back_populates="reservation")


class QRLog(Base):
    __tablename__ = "qr_logs"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id", ondelete="SET NULL"), nullable=True)
    slot_id = Column(Integer, ForeignKey("parking_slots.id", ondelete="SET NULL"), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    verification_status = Column(String(50), nullable=False)  # VALID, INVALID, EXPIRED, ALREADY_USED, VEHICLE_MISMATCH
    action = Column(String(30), nullable=False)  # ENTRY_ALLOWED, ENTRY_DENIED
    fog_node = Column(String(50), default="FOG-NODE-GATEWAY-01", nullable=False)
    timestamp = Column(DateTime, default=datetime.now, nullable=False)
    details = Column(String(255), nullable=True)

    reservation = relationship("Reservation", back_populates="qr_logs")
    slot = relationship("ParkingSlot", back_populates="qr_logs")


class FogLog(Base):
    __tablename__ = "fog_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)  # QR_RECEIVED, LOCAL_VALIDATION, ENTRY_ALLOWED, ENTRY_DENIED, SLOT_UPDATED, CENTRAL_SYNC, VEHICLE_EXIT
    message = Column(Text, nullable=False)
    processing_time = Column(Float, nullable=False)  # Milliseconds
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    fog_node = Column(String(50), default="FOG-NODE-GATEWAY-01", nullable=False)
