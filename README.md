# A Fog Computing-Based Intelligent Parking Management and Secure Slot Reservation System Using QR Authentication

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB.svg?style=flat&logo=python)](https://python.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57.svg?style=flat&logo=sqlite)](https://sqlite.org)
[![Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen.svg)]()

A complete, fully functional full-stack intelligent parking management and reservation system featuring a **Simulated Fog Computing Layer** for decentralized, low-latency QR code authentication and cloud synchronization.

---

## 📌 Table of Contents
1. [Project Overview & Architecture](#-project-overview--architecture)
2. [Fog Computing Simulation Design](#-fog-computing-simulation-design)
3. [Key Features & Capabilities](#-key-features--capabilities)
4. [User Roles & Permissions](#-user-roles--permissions)
5. [Default Demo Credentials](#-default-demo-credentials)
6. [Tech Stack](#-tech-stack)
7. [Quick Start Guide (Windows)](#-quick-start-guide-windows)
8. [Automated Pytest Suite](#-automated-pytest-suite)
9. [REST API Documentation](#-rest-api-documentation)
10. [End-to-End Demonstration Walkthrough](#-end-to-end-demonstration-walkthrough)

---

## 🏗 Project Overview & Architecture

Modern smart parking facilities face latency bottlenecks and single-point-of-failure risks when every gate authentication request must query a distant cloud server. This project implements a **three-tier architecture**:

```
+-------------------------------------------------------------+
|                  1. PRESENTATION LAYER                      |
|   React + Vite SPA • Responsive Dark Navy Design System    |
|   Role-Based Dashboards • QR Camera Scanner • Recharts      |
+------------------------------+------------------------------+
                               | REST API (JWT Authenticated)
                               v
+-------------------------------------------------------------+
|          2. SIMULATED FOG COMPUTING LAYER (EDGE)            |
|   Edge Gateway: FOG-NODE-GATEWAY-01 (FastAPI Service)       |
|   - Sub-50ms local verification latency simulation          |
|   - Local cryptographic QR token & payload validation       |
|   - Instant parking bay state transition (RESERVED->OCCUPIED)|
|   - Anti-tampering & vehicle plate mismatch detection       |
|   - Departure processing & vacancy restoration              |
+------------------------------+------------------------------+
                               | Master Ledger Sync
                               v
+-------------------------------------------------------------+
|              3. CLOUD / CENTRAL DATABASE LAYER              |
|   SQLite + SQLAlchemy ORM Relational Storage                |
|   - User accounts, credentials (Bcrypt), role ACL           |
|   - Master parking bay registry (30 slots across 3 zones)   |
|   - Complete QR access audit trail & Fog event telemetry    |
+-------------------------------------------------------------+
```

---

## ⚡ Fog Computing Simulation Design

The **Edge Fog Layer** (`backend/app/services/fog_service.py`) realistically emulates a physical roadside edge gateway deployed at the parking entrance:

- **Local Verification First**: Verification requests are handled directly by the simulated fog node (`FOG-NODE-GATEWAY-01`) without round-trips to an external third-party cloud.
- **Controlled Latency Emulation**: Each validation step injects a realistic 12ms to 38ms computational and transmission delay to simulate edge hardware processing.
- **Autonomous Slot State Management**: The Fog Node immediately switches the bay from `RESERVED` to `OCCUPIED` at the gate barrier before synchronizing with the central database.
- **Offline Resilience & Audit Stream**: Every attempt (successful or rejected) creates a detailed `QRLog` and `FogLog` entry capturing the timestamp, node identifier, gate action, and latency.
- **Vehicle Departure Desk**: Staff or exit barriers process departures through the edge node, updating the reservation to `COMPLETED` and instantly restoring the bay to `AVAILABLE`.

---

## ✨ Key Features & Capabilities

- **Role-Based Authentication**: Secure JWT bearer tokens with granular roles: `USER`, `STAFF`, and `ADMIN`.
- **Interactive Parking Grid**: Real-time status badges for **30 seeded slots** across **Zone A**, **Zone B**, and **Zone C** for **Car**, **Bike**, and **EV** vehicles.
- **Atomic Slot Reservation**: Concurrency-safe reservation engine preventing duplicate bookings.
- **Cryptographic QR Pass Generation**: Generates 32-byte cryptographically secure tokens. Renders both SVG and high-resolution downloadable Base64 PNG passes.
- **Multi-Mode QR Scanner**:
  - **Live Camera Scanner**: Utilizes HTML5 camera feed for real-time barcode scanning.
  - **Manual Entry Fallback**: Allows paste-in verification of raw tokens or JSON payloads.
  - **1-Click Test Chips**: Pre-populated live database chips for rapid grading and demonstration.
- **Departure & Vacancy Management**: Dedicated staff desk to process vehicle departures and free up parking bays.
- **Executive Analytics Dashboard**: 4 interactive Recharts diagrams (Donut Occupancy, 7-day Bar Trends, QR Outcome Ratios, Zone Distribution) + 8 real-time telemetry metrics.
- **Security Audit Logs**: Chronological immutable ledger of all access attempts and edge telemetry events.

---

## 👥 User Roles & Permissions

| Role | Accessible Routes | Primary Capabilities |
| :--- | :--- | :--- |
| **USER (Driver)** | `/dashboard`, `/parking`, `/reserve`, `/my-reservations`, `/my-qr` | Browse bays, book slot, view/download QR entry pass, cancel bookings, view personal history. |
| **STAFF (Guard)** | `/staff`, `/staff/scan`, `/staff/active-parking` + User routes | Gate scanner, local Fog Node verification, process vehicle exits, monitor active bays. |
| **ADMIN (Manager)**| `/admin`, `/admin/users`, `/admin/slots`, `/admin/reservations`, `/admin/fog`, `/admin/logs` + All routes | Full system control: telemetry charts, user roles/status, slot CRUD, cancel bookings, inspect audit trails. |

---

## 🔑 Default Demo Credentials

The database is pre-seeded with 4 test accounts (Password: `Password123!` for all):

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartparking.com` | `Password123!` | System administrator with full analytics and management rights |
| **Staff** | `staff@smartparking.com` | `Password123!` | Gate security officer with QR scanning and departure permissions |
| **User** | `user@smartparking.com` | `Password123!` | Primary driver with active reservation in Slot A01 |
| **User 2** | `sarah@smartparking.com` | `Password123!` | Secondary driver with active reservation in Slot B02 |

---

## 🛠 Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI**: Asynchronous high-performance REST API.
- **Uvicorn**: Lightning-fast ASGI web server.
- **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper.
- **SQLite**: Zero-configuration transactional database.
- **Pydantic V2**: Robust data parsing, validation, and serialization.
- **Passlib & Direct Bcrypt**: Cryptographically secure password hashing.
- **Python-Jose**: JSON Web Token (JWT) encode and decode.
- **Qrcode & Pillow (PIL)**: Base64 and image QR code generation.
- **Pytest & HTTPX**: Comprehensive automated test suite.

### Frontend
- **React 18 & Vite**: Ultra-fast component bundling and modern UI.
- **React Router DOM (v6)**: Declarative role-protected routing.
- **Axios**: HTTP client with automatic JWT bearer interceptors.
- **Html5-QRCode**: Web camera barcode and QR reading.
- **QRCode.React**: SVG and Canvas client-side rendering.
- **Recharts**: Responsive SVG charting library.
- **Lucide React**: Clean, accessible modern icon set.

---

## 🚀 Quick Start Guide (Windows)

### Option A: 1-Click Launch (Recommended)
Double-click the provided batch script in the project root:
```bat
run_all.bat
```
*This will open the backend server on `http://localhost:8000` and the frontend server on `http://localhost:5173` in two independent windows.*

---

### Option B: Manual Setup via Terminal

#### 1. Backend Setup
Open a terminal in the project root:
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment if not already created
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo accounts and 30 slots
python seed.py

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API Base**: `http://127.0.0.1:8000/api`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
Open a second terminal in the project root:
```powershell
# Navigate to frontend directory
cd frontend

# Install Node modules (if not already installed)
npm install

# Start Vite development server
npm run dev
```
- **Frontend Web Application**: `http://localhost:5173`

---

## 🧪 Automated Pytest Suite

The backend includes a comprehensive 10-test suite covering the entire reservation, anti-collision, QR generation, Fog Node validation, tamper detection, and vehicle departure pipeline.

To run the automated tests:
```powershell
.\backend\venv\Scripts\pytest -v backend\tests\test_api.py
```

### Test Coverage Highlights:
1. `test_user_registration`: Validates user registration with encrypted password storage.
2. `test_user_login`: Verifies JWT issuance and credential matching.
3. `test_jwt_validation_and_me`: Ensures authenticated user profile retrieval.
4. `test_slot_listing_and_creation`: Tests parking slot CRUD and filters.
5. `test_reservation_creation_and_duplicate_prevention`: Proves anti-double-booking locks.
6. `test_qr_generation_and_details`: Validates 32-byte cryptographic token generation.
7. `test_fog_node_verification_valid_and_status_update`: Validates simulated Fog Node edge authentication, sub-50ms latency calculation, and immediate `OCCUPIED` transition.
8. `test_fog_node_verification_used_and_invalid`: Confirms rejection of already-used, cancelled, or forged tokens.
9. `test_vehicle_exit_and_vacancy_restoration`: Tests departure processing and bay status restoration to `AVAILABLE`.
10. `test_fog_status_and_logs`: Verifies telemetry counters and audit stream recording.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new driver account.
- `POST /api/auth/login` — Authenticate and receive JWT bearer token.
- `GET /api/auth/me` — Retrieve active user session profile.

### Parking Slots (`/api/parking`)
- `GET /api/parking/slots` — List parking slots with optional floor/zone/status filters.
- `GET /api/parking/slots/{id}` — Get detailed status of a specific parking bay.
- `POST /api/parking/slots` — [Admin] Create a new parking bay.
- `PUT /api/parking/slots/{id}` — [Admin] Update bay parameters or maintenance state.
- `DELETE /api/parking/slots/{id}` — [Admin] Permanently delete a parking slot.

### Reservations (`/api/reservations`)
- `POST /api/reservations` — Reserve a slot, lock availability, and issue QR token.
- `GET /api/reservations/my` — Get authenticated driver's reservation history.
- `GET /api/reservations` — [Staff/Admin] List all reservations across the facility.
- `PUT /api/reservations/{id}/cancel` — Cancel an active reservation and release the bay.

### QR Code Gateway (`/api/qr`)
- `GET /api/qr/{reservation_id}` — Retrieve QR payload, token, and Base64 PNG pass image.
- `POST /api/qr/generate` — Re-issue a cryptographic QR token for a confirmed reservation.

### Simulated Fog Computing Node (`/api/fog`)
- `POST /api/fog/verify-qr` — Edge verification endpoint. Validates token, checks vehicle match, transitions slot to `OCCUPIED`, records latency, and syncs cloud DB.
- `POST /api/fog/vehicle-exit` — Edge departure endpoint. Marks slot `AVAILABLE` and reservation `COMPLETED`.
- `GET /api/fog/status` — Real-time telemetry (uptime, requests, success/fail counters, mean latency).
- `GET /api/fog/logs` — Edge node operational event stream.
- `GET /api/fog/qr-logs` — Gate verification audit log records.

### System Administration (`/api/admin`)
- `GET /api/admin/dashboard` — 8 primary facility telemetry statistics.
- `GET /api/admin/analytics` — Historical datasets for Recharts charts.
- `GET /api/admin/users` — List all registered users with roles and status.

---

## 🎬 End-to-End Demonstration Walkthrough

Follow these steps to demonstrate every feature to an evaluator:

### 1. Driver Experience
1. Open `http://localhost:5173` and click **Sign In**.
2. Log in as Driver: `user@smartparking.com` / `Password123!`.
3. Notice the **Driver Dashboard** showing live slot capacity, an active reservation banner for **Slot A01**, and quick actions.
4. Click **View Entry QR** to inspect the QR Pass popup. Click **Download QR** to save the PNG pass.
5. Click **Parking Slots** in the navigation to view the full interactive grid of 30 slots across Zone A, B, and C.
6. Click **Book Slot**, pick an available bay (e.g. `A02`), and complete a booking. Notice the slot immediately turns `RESERVED` on the map.

### 2. Gate Security Guard & Fog Node Experience
1. Log out and log in as Security Staff: `staff@smartparking.com` / `Password123!`.
2. Notice the **Security Gate & Staff Terminal** displaying live Fog Node statistics (`FOG-NODE-GATEWAY-01`), allowed/denied entry counts, and facility occupancy.
3. Click **Scan QR Entry**.
4. In the scanner page, click any of the **Instant Testing Chips** (e.g. click `RES-... (A01) - CONFIRMED`).
5. Observe the verification result:
   - Green **ENTRY_ALLOWED** banner.
   - Sub-50ms edge processing latency displayed (e.g. `24.5ms`).
   - Slot A01 status automatically updates to **OCCUPIED**.
6. Test security denial: Click **Test Forged / Invalid Token**. Observe the red **ENTRY_DENIED** alert.
7. Click **Active Parking & Exit** from the sidebar. Notice Slot A01 listed under *Vehicles Currently Parked*.
8. Click **Process Vehicle Exit**. The bay is freed and immediately returns to **AVAILABLE**!

### 3. Administrator Experience
1. Log out and log in as Admin: `admin@smartparking.com` / `Password123!`.
2. The **Admin Analytics** page displays:
   - 8 metric cards (Total Bays, Available, Reserved, Occupied, Total Users, Active Bookings, Total Scans, Denials).
   - 4 Recharts visual charts (Occupancy Donut, Daily Traffic Bar, Outcome Ratios, Zone Distributions).
3. Navigate to **User Management** (`/admin/users`) to view user accounts, change roles between `USER`, `STAFF`, and `ADMIN`, or deactivate users.
4. Navigate to **Slot Management** (`/admin/slots`) to add new bays, toggle maintenance mode, or edit designations.
5. Navigate to **Fog Node Monitor** (`/admin/fog`) to inspect live edge hardware telemetry and the chronological event stream.
6. Navigate to **QR Audit Logs** (`/admin/logs`) to view the permanent immutable record of every scan attempt with timestamp, vehicle plate, outcome, and edge node identifier.

---

## 📄 License
This project is developed as an academic and engineering reference implementation of Fog Computing in Smart Transportation and IoT Parking Systems.
#   F o g _ B a s e d _ S m a r t _ P a r k i n g _ S y s t e m  
 