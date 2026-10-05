import React, { useState, useEffect } from 'react';
import { ListOrdered, Search, QrCode, XCircle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { reservationService } from '../services/reservationService';
import { qrService } from '../services/qrService';
import { formatDateTime } from '../utils/formatters';
import QRModal from '../components/QRModal';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [qrModalData, setQrModalData] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchReservations = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await reservationService.getAllReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleOpenQR = async (resId) => {
    try {
      const qrData = await qrService.getQR(resId);
      setQrModalData(qrData);
    } catch (err) {
      alert('Failed to retrieve QR code pass');
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Cancel this booking as administrator? The slot will immediately return to AVAILABLE.')) return;
    try {
      const res = await reservationService.cancelReservation(resId);
      setMessage(res.message);
      setTimeout(() => setMessage(null), 4000);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel reservation');
    }
  };

  const filtered = reservations.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const codeMatch = r.reservation_code.toLowerCase().includes(q);
      const slotMatch = r.slot?.slot_code?.toLowerCase().includes(q);
      const userMatch = r.user?.name?.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q);
      const plateMatch = r.vehicle_number?.toLowerCase().includes(q);
      if (!codeMatch && !slotMatch && !userMatch && !plateMatch) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ListOrdered size={26} style={{ color: '#38bdf8' }} />
            <span>Master Reservation Registry</span>
          </h1>
          <p className="page-subtitle">
            Complete record of driver reservations, QR pass statuses, and time windows.
          </p>
        </div>

        <button
          onClick={() => fetchReservations(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'CONFIRMED', 'USED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: statusFilter === st ? '#2563eb' : '#1e293b',
                  color: statusFilter === st ? '#fff' : '#94a3b8',
                  border: statusFilter === st ? '1px solid #3b82f6' : '1px solid #334155'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search code, user, slot, plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking Code</th>
                <th>User / Driver</th>
                <th>Bay Code</th>
                <th>Vehicle Plate</th>
                <th>Entry Window</th>
                <th>Exit Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {r.reservation_code}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{r.user?.name || `User #${r.user_id}`}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.user?.email}</div>
                  </td>
                  <td style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {r.slot?.slot_code || `Slot #${r.slot_id}`}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.vehicle_number}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDateTime(r.entry_time)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDateTime(r.expected_exit_time)}</td>
                  <td>
                    <span className={`badge ${r.status === 'CONFIRMED' ? 'badge-reserved' : r.status === 'USED' ? 'badge-occupied' : r.status === 'COMPLETED' ? 'badge-available' : 'badge-maintenance'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenQR(r.id)}
                        className="btn btn-primary btn-sm"
                        title="Inspect QR Pass"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <QrCode size={14} />
                      </button>

                      {r.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelReservation(r.id)}
                          className="btn btn-danger btn-sm"
                          title="Admin Cancel"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {qrModalData && (
        <QRModal qrData={qrModalData} onClose={() => setQrModalData(null)} />
      )}
    </div>
  );
}
