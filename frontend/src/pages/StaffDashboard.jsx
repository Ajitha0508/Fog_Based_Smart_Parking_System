import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  CarFront,
  CheckCircle2,
  Clock,
  Ban,
  Wrench,
  Cpu,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { fogService } from '../services/fogService';
import { useInterval } from '../hooks/useInterval';
import FogStatusBadge from '../components/FogStatusBadge';
import { formatDateTime } from '../utils/formatters';

export default function StaffDashboard() {
  const [slots, setSlots] = useState([]);
  const [fogStatus, setFogStatus] = useState(null);
  const [qrLogs, setQrLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStaffData = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [allSlots, status, logs] = await Promise.all([
        parkingService.getSlots(),
        fogService.getFogStatus(),
        fogService.getQRLogs(6)
      ]);
      setSlots(allSlots);
      setFogStatus(status);
      setQrLogs(logs);
    } catch (err) {
      console.error('Error loading staff dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  useInterval(() => {
    loadStaffData(false);
  }, 6000);

  const total = slots.length;
  const available = slots.filter((s) => s.status === 'AVAILABLE').length;
  const reserved = slots.filter((s) => s.status === 'RESERVED').length;
  const occupied = slots.filter((s) => s.status === 'OCCUPIED').length;
  const occupancyPercent = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ScanLine size={26} style={{ color: '#f59e0b' }} />
            <span>Security Gate & Staff Terminal</span>
          </h1>
          <p className="page-subtitle">
            Local gate management console powered by Edge Fog Node verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => loadStaffData(true)}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Live Sync'}</span>
          </button>
          <Link to="/staff/scan" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <ScanLine size={18} />
            <span>Scan QR for Entry</span>
          </Link>
        </div>
      </div>

      {/* Edge Node Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(14, 25, 45, 0.95), rgba(10, 16, 30, 0.95))',
        border: '1px solid #0284c7',
        marginBottom: '2rem',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  {fogStatus?.fog_node_id || 'FOG-NODE-GATEWAY-01'}
                </span>
                <span className="badge badge-online">ONLINE • LOCAL VALIDATION</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {fogStatus?.location || 'Terminal North Gateway'} • Mean Latency: <strong>{fogStatus?.average_processing_time_ms || 22}ms</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {fogStatus?.successful_verifications || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Allowed</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
                {fogStatus?.rejected_verifications || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Denied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Overview & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Occupancy card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <CarFront size={20} style={{ color: '#38bdf8' }} />
              <span>Current Facility Occupancy</span>
            </h2>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{occupancyPercent}%</span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '10px', background: '#1e293b', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{
              width: `${occupancyPercent}%`,
              height: '100%',
              background: occupancyPercent > 80 ? '#ef4444' : occupancyPercent > 50 ? '#f59e0b' : '#10b981',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: '#0b1120', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{available}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Available</div>
            </div>
            <div style={{ background: '#0b1120', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>{reserved}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reserved</div>
            </div>
            <div style={{ background: '#0b1120', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>{occupied}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Occupied</div>
            </div>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link
            to="/staff/scan"
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              border: '1px solid #2563eb',
              background: 'rgba(37, 99, 235, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanLine size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Gate Ingress Scanner</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Scan driver QR codes for instant Fog validation</div>
              </div>
            </div>
            <ArrowRight size={20} style={{ color: '#38bdf8' }} />
          </Link>

          <Link
            to="/staff/active-parking"
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              border: '1px solid #059669',
              background: 'rgba(16, 185, 129, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarFront size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Departure & Vacancy Desk</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Process vehicle departures & free parking bays</div>
              </div>
            </div>
            <ArrowRight size={20} style={{ color: '#34d399' }} />
          </Link>
        </div>
      </div>

      {/* Recent QR Verifications Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <ShieldCheck size={20} style={{ color: '#38bdf8' }} />
            <span>Recent Gate QR Verifications</span>
          </h2>
          <Link to="/staff/scan" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
            Open Scanner
          </Link>
        </div>

        {qrLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No recent gate authentications logged yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Vehicle Number</th>
                  <th>Bay Code</th>
                  <th>Verification Status</th>
                  <th>Gate Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {qrLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {log.vehicle_number || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                      {log.slot_code || `Slot #${log.slot_id}`}
                    </td>
                    <td>
                      <span className={`badge ${log.verification_status === 'SUCCESS' ? 'badge-available' : 'badge-occupied'}`}>
                        {log.verification_status}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: log.action === 'ENTRY_ALLOWED' ? '#34d399' : '#f87171'
                      }}>
                        {log.action === 'ENTRY_ALLOWED' ? '✓ ALLOWED' : '✗ DENIED'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {log.details || 'Processed at edge node'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
