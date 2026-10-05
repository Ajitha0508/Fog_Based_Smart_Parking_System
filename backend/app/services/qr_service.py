import secrets
import json
import base64
import io
from datetime import datetime
from typing import Tuple
import qrcode
from sqlalchemy.orm import Session
from app.models import Reservation

def generate_secure_token() -> str:
    """Generate a high-entropy cryptographically secure random token."""
    return secrets.token_urlsafe(32)

def generate_reservation_code(db: Session) -> str:
    """Generate a clean human-readable and unique reservation code, e.g. RES-20260924-001."""
    date_str = datetime.now().strftime("%Y%m%d")
    count = db.query(Reservation).filter(Reservation.reservation_code.like(f"RES-{date_str}-%")).count()
    return f"RES-{date_str}-{count + 1:03d}"

def create_qr_payload(reservation_code: str, token: str) -> str:
    """Standardized JSON payload for QR code embedding."""
    return json.dumps({
        "reservation_id": reservation_code,
        "token": token
    })

def parse_scanned_token(raw_input: str) -> Tuple[str, str]:
    """
    Parse scanned QR code content.
    Can be a JSON payload: {"reservation_id": "RES-...", "token": "..."}
    or a direct token string.
    Returns (reservation_code, token).
    """
    raw_input = raw_input.strip()
    try:
        data = json.loads(raw_input)
        if isinstance(data, dict):
            return data.get("reservation_id", ""), data.get("token", "")
    except Exception:
        pass
    
    # If not valid JSON, treat the whole string as the token
    return "", raw_input

def generate_qr_image_base64(payload_text: str) -> str:
    """Generate base64 encoded PNG image for the QR code payload."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(payload_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
