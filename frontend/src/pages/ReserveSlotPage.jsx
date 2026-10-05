import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarPlus, Car, MapPin, Clock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parkingService } from '../services/parkingService';
import { reservationService } from '../services/reservationService';
import { toLocalDateTimeInputString } from '../utils/formatters';
import QRModal from '../components/QRModal';

export default function ReserveSlotPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const preselectedSlotId = queryParams.get('slot_id');

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(preselectedSlotId || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicle_number || '');
  const [vehicleType, setVehicleType] = useState('Car');

  // Set default times based on actual laptop clock (entry in 15 mins, exit in 2 hours)
  const now = new Date();
  const defaultEntry = toLocalDateTimeInputString(new Date(now.getTime() + 15 * 60000));
  const defaultExit = toLocalDateTimeInputString(new Date(now.getTime() + 135 * 60000));

  const [entryTime, setEntryTime] = useState(defaultEntry);
  const [expectedExitTime, setExpectedExitTime] = useState(defaultExit);

  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdQR, setCreatedQR] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const slots = await parkingService.getSlots({ active_only: true });
        // Include available slots or the currently preselected slot
        const filtered = slots.filter((s) => s.status === 'AVAILABLE' || String(s.id) === String(preselectedSlotId));
        setAvailableSlots(filtered);
        
        if (preselectedSlotId && !selectedSlotId) {
          setSelectedSlotId(preselectedSlotId);
        } else if (filtered.length > 0 && !selectedSlotId) {
          setSelectedSlotId(filtered[0].id);
        }
      } catch (err) {
        console.error('Error fetching available slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [preselectedSlotId]);

  // Adjust default vehicle type when slot is selected
  useEffect(() => {
    if (selectedSlotId) {
      const slot = availableSlots.find((s) => String(s.id) === String(selectedSlotId));
      if (slot) {
        setVehicleType(slot.vehicle_type);
      }
    }
  }, [selectedSlotId, availableSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const entryDate = new Date(entryTime);
    const exitDate = new Date(expectedExitTime);

    if (exitDate <= entryDate) {
      setError('Expected exit time must be strictly after entry time.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        slot_id: parseInt(selectedSlotId, 10),
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_type: vehicleType,
        entry_time: entryTime.length === 16 ? `${entryTime}:00` : entryTime,
        expected_exit_time: expectedExitTime.length === 16 ? `${expectedExitTime}:00` : expectedExitTime
      };

      const res = await reservationService.createReservation(payload);
      
      // Setup QR data for the modal
      setCreatedQR({
        reservation_id: res.id,
        reservation_code: res.reservation_code,
        slot_code: res.slot?.slot_code || 'Assigned',
        vehicle_number: res.vehicle_number,
        entry_time: res.entry_time,
        expected_exit_time: res.expected_exit_time,
        status: res.status,
        qr_token: res.qr_token,
        qr_payload: JSON.stringify({
          reservation_id: res.reservation_code,
          token: res.qr_token
        })
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to complete slot reservation. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSlot = availableSlots.find((s) => String(s.id) === String(selectedSlotId));

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarPlus size={26} style={{ color: '#38bdf8' }} />
            <span>Reserve a Parking Slot</span>
          </h1>
          <p className="page-subtitle">
            Lock in your parking bay. Secure QR code is automatically generated upon reservation.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Slot Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Choose Parking Slot:</span>
              <span style={{ color: '#38bdf8', fontSize: '0.8rem' }}>
                {availableSlots.length} bays currently available
              </span>
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="form-select"
              required
              disabled={loadingSlots}
              style={{ fontSize: '0.95rem' }}
            >
              {availableSlots.length === 0 ? (
                <option value="">No available slots right now</option>
              ) : (
                availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    Bay {s.slot_code} — {s.floor}, {s.zone} ({s.vehicle_type} designated)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Slot Highlight preview card */}
          {selectedSlot && (
            <div style={{
              background: '#0b1120',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem',
              padding: '0.875rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Selected: </span>
                <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  Slot {selectedSlot.slot_code}
                </strong>
                <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                  ({selectedSlot.floor} • {selectedSlot.zone})
                </span>
              </div>
              <span className="badge badge-available">AVAILABLE</span>
            </div>
          )}

          {/* Vehicle info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Vehicle Registration Number</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. KA-01-AB-1234"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="form-select"
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike / Motorcycle</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>
          </div>

          {/* Time range */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Planned Entry Time</label>
              <input
                type="datetime-local"
                required
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Departure Time</label>
              <input
                type="datetime-local"
                required
                value={expectedExitTime}
                onChange={(e) => setExpectedExitTime(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Fog Edge info note */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: '#67e8f9'
          }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <div>
              Your unique reservation QR pass will be issued immediately upon confirmation and will be valid for local Fog Node gate verification.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || availableSlots.length === 0}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', gap: '0.6rem' }}
          >
            <ShieldCheck size={20} />
            <span>{submitting ? 'Reserving & Generating Pass...' : 'Confirm Reservation & Generate QR Pass'}</span>
          </button>
        </form>
      </div>

      {/* QR Confirmation Modal */}
      {createdQR && (
        <QRModal
          qrData={createdQR}
          onClose={() => {
            setCreatedQR(null);
            navigate('/my-qr');
          }}
        />
      )}
    </div>
  );
}

