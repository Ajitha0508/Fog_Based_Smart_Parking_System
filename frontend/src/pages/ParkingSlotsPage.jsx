import React, { useState, useEffect } from 'react';
import { Grid3X3, RefreshCw, Car, Bike, Zap, CheckCircle2, Clock, Ban, Wrench } from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { useInterval } from '../hooks/useInterval';
import ParkingGrid from '../components/ParkingGrid';

export default function ParkingSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSlots = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await parkingService.getSlots();
      setSlots(data);
    } catch (err) {
      console.error('Error loading slots:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Real-time polling every 6 seconds
  useInterval(() => {
    fetchSlots(false);
  }, 6000);

  const total = slots.length;
  const available = slots.filter((s) => s.status === 'AVAILABLE').length;
  const reserved = slots.filter((s) => s.status === 'RESERVED').length;
  const occupied = slots.filter((s) => s.status === 'OCCUPIED').length;
  const maintenance = slots.filter((s) => s.status === 'MAINTENANCE').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Grid3X3 size={26} style={{ color: '#38bdf8' }} />
            <span>Real-Time Parking Slots</span>
          </h1>
          <p className="page-subtitle">
            Interactive visual parking zones with live state synchronized from the Fog Gateway.
          </p>
        </div>

        <button
          onClick={() => fetchSlots(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Live Sync'}</span>
        </button>
      </div>

      {/* Quick Legend Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
              <span style={{ color: '#e2e8f0' }}>Available: <strong>{available}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
              <span style={{ color: '#e2e8f0' }}>Reserved: <strong>{reserved}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
              <span style={{ color: '#e2e8f0' }}>Occupied: <strong>{occupied}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#64748b' }} />
              <span style={{ color: '#e2e8f0' }}>Maintenance: <strong>{maintenance}</strong></span>
            </div>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            Total Capacity: <strong>{total} Bays</strong> • Auto-updating
          </div>
        </div>
      </div>

      {/* Visual Parking Grid Component */}
      <ParkingGrid slots={slots} showBookingModal={true} />
    </div>
  );
}

