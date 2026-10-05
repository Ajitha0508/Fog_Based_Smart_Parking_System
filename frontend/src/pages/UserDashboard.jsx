import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Grid3X3,
  CheckCircle2,
  Clock,
  Ban,
  Car,
  QrCode,
  CalendarPlus,
  ArrowRight,
  AlertCircle,
  XCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parkingService } from '../services/parkingService';
import { reservationService } from '../services/reservationService';
import { qrService } from '../services/qrService';
import { useInterval } from '../hooks/useInterval';
import SlotCard from '../components/SlotCard';
import QRModal from '../components/QRModal';
import { formatDateTime, formatDate } from '../utils/formatters';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeReservation, setActiveReservation] = useState(null);
  const [qrModalData, setQrModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(null);

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [allSlots, myReservations] = await Promise.all([
        parkingService.getSlots(),
        reservationService.getMyReservations()
      ]);
      setSlots(allSlots);
      setReservations(myReservations);

      const active = myReservations.find((r) => r.status === 'CONFIRMED' || r.status === 'USED');
      setActiveReservation(active || null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useInterval(() => loadData(false), 8000);

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will become available for others.')) {
      return;
    }
    try {
      await reservationService.cancelReservation(id);
      setCancelMessage('Reservation successfully cancelled.');
      setTimeout(() => setCancelMessage(null), 4000);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel reservation.');
    }
  };

  const handleOpenQR = async (reservationId) => {
    try {
      const data = await qrService.getQR(reservationId);
      setQrModalData(data);
    } catch (err) {
      alert('Unable to load QR pass details.');
    }
  };

  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
  const reservedSlots = slots.filter((s) => s.status === 'RESERVED').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#94a3b8' }}>
        <div>Loading dashboard metrics...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            <Car size={26} style={{ color: '#38bdf8' }} />
            <span>Driver Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Welcome back, {user?.name}. Real-time parking availability and active reservations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => loadData(true)}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
          </button>
          <Link to="/reserve" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
            <CalendarPlus size={16} />
            <span>Reserve Slot</span>
          </Link>
        </div>
      </div>

      {cancelMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{cancelMessage}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Grid3X3 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalSlots}</span>
            <span className="stat-label">Total Slots</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#34d399' }}>{availableSlots}</span>
            <span className="stat-label">Available Slots</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#fbbf24' }}>{reservedSlots}</span>
            <span className="stat-label">Reserved Slots</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <Ban size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#f87171' }}>{occupiedSlots}</span>
            <span className="stat-label">Occupied Slots</span>
          </div>
        </div>
      </div>

      {/* Active Reservation Banner */}
      {activeReservation ? (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(14, 28, 54, 0.95), rgba(15, 23, 42, 0.95))',
          border: '1px solid #2563eb',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: activeReservation.status === 'CONFIRMED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: activeReservation.status === 'CONFIRMED' ? '#fbbf24' : '#f87171',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {activeReservation.status === 'CONFIRMED' ? 'Upcoming Reservation' : 'Vehicle Currently Parked'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem' }}>
                  {activeReservation.reservation_code}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Booked for vehicle <strong>{activeReservation.vehicle_number}</strong> ({activeReservation.vehicle_type})
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleOpenQR(activeReservation.id)}
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                <QrCode size={18} />
                <span>View Entry QR</span>
              </button>

              {activeReservation.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleCancelReservation(activeReservation.id)}
                  className="btn btn-danger btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <XCircle size={15} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #1f2937'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Assigned Slot</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {activeReservation.slot?.slot_code || 'A01'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {activeReservation.slot?.floor} • {activeReservation.slot?.zone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Entry Window</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                {formatDateTime(activeReservation.entry_time)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Expected Exit</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                {formatDateTime(activeReservation.expected_exit_time)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Security Verification</div>
              <div style={{ fontSize: '0.85rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                <ShieldCheck size={16} />
                <span>Ready for Fog Scan</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{
          padding: '1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px dashed #334155',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>No Active Parking Reservation</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Select an available parking slot now to guarantee your spot with high-speed QR check-in.
            </div>
          </div>
          <Link to="/reserve" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <span>Find & Book a Slot</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Available Slots Preview & Quick Book */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Live Slot Availability (Zone A, B & C)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Click any available slot to quickly reserve it
            </p>
          </div>
          <Link to="/parking" style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View Full Interactive Map</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.875rem'
        }}>
          {slots.slice(0, 12).map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onSelect={(s) => {
                if (s.status === 'AVAILABLE') {
                  navigate(`/reserve?slot_id=${s.id}`);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} style={{ color: '#38bdf8' }} />
            <span>My Recent Reservations</span>
          </h2>
          <Link to="/my-reservations" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
            View Full History
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            No reservation history found yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking Code</th>
                  <th>Slot</th>
                  <th>Vehicle Number</th>
                  <th>Entry Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                      {r.reservation_code}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      {r.slot?.slot_code || `Slot #${r.slot_id}`}
                    </td>
                    <td>{r.vehicle_number}</td>
                    <td>{formatDateTime(r.entry_time)}</td>
                    <td>
                      <span className={`badge ${r.status === 'CONFIRMED' ? 'badge-reserved' : r.status === 'USED' ? 'badge-occupied' : r.status === 'COMPLETED' ? 'badge-available' : 'badge-maintenance'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenQR(r.id)}
                          className="btn btn-secondary btn-sm"
                          title="View QR Code"
                          style={{ gap: '0.3rem' }}
                        >
                          <QrCode size={14} />
                          <span>QR</span>
                        </button>
                        {r.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelReservation(r.id)}
                            className="btn btn-danger btn-sm"
                            title="Cancel Reservation"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal Popup */}
      {qrModalData && (
        <QRModal qrData={qrModalData} onClose={() => setQrModalData(null)} />
      )}
    </div>
  );
}
