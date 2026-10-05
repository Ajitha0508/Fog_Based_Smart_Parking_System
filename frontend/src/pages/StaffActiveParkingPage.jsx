import React, { useState, useEffect } from 'react';
import { CarFront, Clock, LogOut, CheckCircle2, AlertCircle, RefreshCw, Car } from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { reservationService } from '../services/reservationService';
import { fogService } from '../services/fogService';
import { useInterval } from '../hooks/useInterval';
import { formatDateTime } from '../utils/formatters';

export default function StaffActiveParkingPage() {
  const [slots, setSlots] = useState([]);
  const [activeReservations, setActiveReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exitProcessingId, setExitProcessingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [allSlots, allRes] = await Promise.all([
        parkingService.getSlots(),
        reservationService.getAllReservations()
      ]);
      setSlots(allSlots);
      setActiveReservations(allRes);
    } catch (err) {
      console.error('Error loading active parking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useInterval(() => {
    loadData(false);
  }, 6000);

  const handleVehicleExit = async (slotId, reservationId = null) => {
    setExitProcessingId(slotId);
    setNotification(null);

    try {
      const res = await fogService.vehicleExit(slotId, reservationId);
      setNotification({
        type: 'success',
        message: res.message || `Bay ${res.slot_code} marked as AVAILABLE.`
      });
      loadData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to process vehicle exit.'
      });
    } finally {
      setExitProcessingId(null);
    }
  };

  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED');
  const reservedSlots = slots.filter((s) => s.status === 'RESERVED');

  if (loading) {
    return <div className="page-container"><p>Loading live facility parking map...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CarFront size={26} style={{ color: '#10b981' }} />
            <span>Active Parking & Vehicle Departure Desk</span>
          </h1>
          <p className="page-subtitle">
            Monitor parked vehicles and process departures to restore bay availability.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
        </button>
      </div>

      {notification && (
        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Occupied vehicles section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'inline-block'
            }} />
            <span>Vehicles Currently Parked (OCCUPIED: {occupiedSlots.length})</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Click "Process Exit" upon physical departure
          </span>
        </div>

        {occupiedSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>No Occupied Parking Bays</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>All parking bays are currently available or awaiting incoming arrivals.</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bay ID</th>
                  <th>Floor / Zone</th>
                  <th>Type</th>
                  <th>Vehicle License</th>
                  <th>Actual Entry Time</th>
                  <th>Booking ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {occupiedSlots.map((slot) => {
                  const matchingRes = activeReservations.find((r) => r.slot_id === slot.id && r.status === 'USED');
                  return (
                    <tr key={slot.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>
                        {slot.slot_code}
                      </td>
                      <td>{slot.floor} • {slot.zone}</td>
                      <td>{slot.vehicle_type}</td>
                      <td>
                        <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                          {matchingRes?.vehicle_number || 'Parked Vehicle'}
                        </strong>
                      </td>
                      <td>
                        {matchingRes?.actual_entry_time ? formatDateTime(matchingRes.actual_entry_time) : 'Active'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {matchingRes?.reservation_code || 'Direct Bay Lock'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleVehicleExit(slot.id, matchingRes?.id)}
                          disabled={exitProcessingId === slot.id}
                          className="btn btn-success btn-sm"
                          style={{ gap: '0.35rem' }}
                        >
                          <LogOut size={14} />
                          <span>{exitProcessingId === slot.id ? 'Processing...' : 'Process Vehicle Exit'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reserved Incoming Vehicles */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} style={{ color: '#f59e0b' }} />
            <span>Upcoming / Reserved Bays ({reservedSlots.length})</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Awaiting QR authentication at Gate
          </span>
        </div>

        {reservedSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No incoming reserved slots right now.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bay ID</th>
                  <th>Floor / Zone</th>
                  <th>Type</th>
                  <th>Vehicle Number</th>
                  <th>Expected Entry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservedSlots.map((slot) => {
                  const matchingRes = activeReservations.find((r) => r.slot_id === slot.id && r.status === 'CONFIRMED');
                  return (
                    <tr key={slot.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fbbf24' }}>
                        {slot.slot_code}
                      </td>
                      <td>{slot.floor} • {slot.zone}</td>
                      <td>{slot.vehicle_type}</td>
                      <td>
                        <strong style={{ color: '#fff' }}>
                          {matchingRes?.vehicle_number || 'Awaiting Driver'}
                        </strong>
                      </td>
                      <td>
                        {matchingRes ? formatDateTime(matchingRes.entry_time) : 'Upcoming'}
                      </td>
                      <td>
                        <span className="badge badge-reserved">RESERVED</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
