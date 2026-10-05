import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, QrCode, XCircle, Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { reservationService } from '../services/reservationService';
import { qrService } from '../services/qrService';
import { formatDateTime, formatDate } from '../utils/formatters';
import QRModal from '../components/QRModal';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [qrModalData, setQrModalData] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchReservations = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
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
      alert('Failed to retrieve QR pass details');
    }
  };

  const handleCancel = async (resId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will be freed immediately.')) {
      return;
    }
    try {
      const res = await reservationService.cancelReservation(resId);
      setMessage(res.message);
      setTimeout(() => setMessage(null), 5000);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel reservation');
    }
  };

  const filtered = reservations.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const codeMatch = r.reservation_code.toLowerCase().includes(q);
      const slotMatch = r.slot?.slot_code?.toLowerCase().includes(q);
      const plateMatch = r.vehicle_number?.toLowerCase().includes(q);
      if (!codeMatch && !slotMatch && !plateMatch) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <History size={26} style={{ color: '#38bdf8' }} />
            <span>My Reservation History</span>
          </h1>
          <p className="page-subtitle">
            View all your parking passes, entry times, and QR access codes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => fetchReservations(true)}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/reserve" className="btn btn-primary btn-sm">
            Book New Slot
          </Link>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'CONFIRMED', 'USED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: filterStatus === st ? '#2563eb' : '#1e293b',
                  color: filterStatus === st ? '#fff' : '#94a3b8',
                  border: filterStatus === st ? '1px solid #3b82f6' : '1px solid #334155'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search code, slot, plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', color: '#64748b' }} />
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>No Reservations Found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>You don't have any bookings matching this filter.</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Parking Slot</th>
                  <th>Vehicle Info</th>
                  <th>Entry Window</th>
                  <th>Expected Exit</th>
                  <th>Actual Entry/Exit</th>
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
                      <div style={{ fontWeight: 700, color: '#fff' }}>
                        {r.slot?.slot_code || `Slot #${r.slot_id}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {r.slot?.floor} • {r.slot?.zone}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{r.vehicle_number}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.vehicle_type}</div>
                    </td>
                    <td>{formatDateTime(r.entry_time)}</td>
                    <td>{formatDateTime(r.expected_exit_time)}</td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {r.actual_entry_time ? `In: ${formatDateTime(r.actual_entry_time)}` : 'Not yet arrived'}
                      {r.actual_exit_time && <div>Out: {formatDateTime(r.actual_exit_time)}</div>}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'CONFIRMED' ? 'badge-reserved' : r.status === 'USED' ? 'badge-occupied' : r.status === 'COMPLETED' ? 'badge-available' : 'badge-maintenance'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenQR(r.id)}
                          className="btn btn-primary btn-sm"
                          title="View QR Pass"
                          style={{ gap: '0.35rem' }}
                        >
                          <QrCode size={14} />
                          <span>QR Pass</span>
                        </button>
                        {r.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="btn btn-danger btn-sm"
                            title="Cancel reservation"
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

      {/* QR Modal */}
      {qrModalData && (
        <QRModal qrData={qrModalData} onClose={() => setQrModalData(null)} />
      )}
    </div>
  );
}
