from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ==================== USER SCHEMAS ====================
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)
    vehicle_number: Optional[str] = Field(None, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = "USER"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserRoleUpdate(BaseModel):
    role: str
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str
    role: str
    vehicle_number: Optional[str] = None
    is_active: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== PARKING SLOT SCHEMAS ====================
class SlotBase(BaseModel):
    slot_code: str
    floor: str
    zone: str
    vehicle_type: str = "Car"
    status: str = "AVAILABLE"
    is_active: bool = True

class SlotCreate(SlotBase):
    pass

class SlotUpdate(BaseModel):
    slot_code: Optional[str] = None
    floor: Optional[str] = None
    zone: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class SlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slot_code: str
    floor: str
    zone: str
    vehicle_type: str
    status: str
    is_active: bool


# ==================== RESERVATION SCHEMAS ====================
class ReservationCreate(BaseModel):
    slot_id: int
    vehicle_number: str = Field(..., min_length=2, max_length=50)
    vehicle_type: str = Field("Car", max_length=20)
    entry_time: datetime
    expected_exit_time: datetime

class ReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reservation_code: str
    user_id: int
    slot_id: int
    vehicle_number: str
    vehicle_type: str
    booking_time: datetime
    entry_time: datetime
    expected_exit_time: datetime
    actual_entry_time: Optional[datetime] = None
    actual_exit_time: Optional[datetime] = None
    status: str
    qr_token: str
    created_at: datetime
    slot: Optional[SlotResponse] = None
    user: Optional[UserResponse] = None

class ReservationCancelResponse(BaseModel):
    success: bool
    message: str
    reservation_id: int
    status: str


# ==================== QR SCHEMAS ====================
class QRDetailsResponse(BaseModel):
    reservation_id: int
    reservation_code: str
    slot_id: int
    slot_code: str
    floor: str
    zone: str
    vehicle_number: str
    vehicle_type: str
    entry_time: datetime
    expected_exit_time: datetime
    status: str
    qr_token: str
    qr_payload: str
    qr_code_base64: Optional[str] = None


# ==================== FOG NODE SCHEMAS ====================
class QRVerifyRequest(BaseModel):
    qr_token: str
    scanned_vehicle_number: Optional[str] = None

class QRVerifyResponse(BaseModel):
    success: bool
    message: str
    action: str
    reservation_id: Optional[int] = None
    reservation_code: Optional[str] = None
    slot_id: Optional[int] = None
    slot_code: Optional[str] = None
    vehicle_number: Optional[str] = None
    processing_time_ms: float
    fog_node: str

class VehicleExitRequest(BaseModel):
    slot_id: Optional[int] = None
    reservation_id: Optional[int] = None

class VehicleExitResponse(BaseModel):
    success: bool
    message: str
    slot_id: int
    slot_code: str
    reservation_id: Optional[int] = None
    reservation_code: Optional[str] = None
    exit_time: datetime

class FogLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    message: str
    processing_time: float
    created_at: datetime
    fog_node: str

class QRLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reservation_id: Optional[int] = None
    slot_id: Optional[int] = None
    slot_code: Optional[str] = None
    vehicle_number: Optional[str] = None
    verification_status: str
    action: str
    fog_node: str
    timestamp: datetime
    details: Optional[str] = None

class FogStatusResponse(BaseModel):
    status: str
    fog_node_id: str
    location: str
    processing_mode: str
    total_requests: int
    successful_verifications: int
    rejected_verifications: int
    average_processing_time_ms: float
    last_verification_time: Optional[datetime] = None
    recent_events: List[FogLogResponse]


# ==================== ADMIN & ANALYTICS SCHEMAS ====================
class DashboardStatsResponse(BaseModel):
    total_slots: int
    available_slots: int
    reserved_slots: int
    occupied_slots: int
    maintenance_slots: int
    total_users: int
    active_reservations: int
    total_qr_verifications: int
    rejected_attempts: int

class AnalyticsResponse(BaseModel):
    occupancy_breakdown: List[dict]
    daily_reservations: List[dict]
    qr_verification_metrics: List[dict]
    zone_occupancy: List[dict]
