import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { fogService } from '../services/fogService';
import { useInterval } from '../hooks/useInterval';
import { formatDateTime } from '../utils/formatters';

export default function AdminFogPage() {
  const [fogStatus, setFogStatus] = useState(null);
  const [fogLogs, setFogLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFogTelemetry = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [status, logs] = await Promise.all([
        fogService.getFogStatus(),
        fogService.getFogLogs(30)
      ]);
      setFogStatus(status);
      setFogLogs(logs);
    } catch (err) {
      console.error('Error fetching Fog telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFogTelemetry();
  }, []);

  useInterval(() => {
    fetchFogTelemetry(false);
  }, 5000);

  if (loading) {
    return <div className="page-container"><p>Connecting to Edge Fog Node...</p></div>;
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'ENTRY_ALLOWED':
        return <span className="badge badge-available">ENTRY ALLOWED</span>;
      case 'ENTRY_DENIED':
        return <span className="badge badge-occupied">ENTRY DENIED</span>;
      case 'LOCAL_VALIDATION':
        return <span className="badge badge-online">LOCAL VALIDATION</span>;
      case 'SLOT_UPDATED':
        return <span className="badge badge-reserved">SLOT UPDATED</span>;
      case 'CENTRAL_SYNC':
        return <span className="badge badge-online">DATABASE SYNC</span>;
      case 'VEHICLE_EXIT':
        return <span className="badge badge-available">VEHICLE EXIT</span>;
      case 'QR_RECEIVED':
      default:
        return <span className="badge badge-maintenance">QR RECEIVED</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Cpu size={26} style={{ color: '#06b6d4' }} />
            <span>Fog Node Edge Computing Gateway</span>
          </h1>
          <p className="page-subtitle">
            Hardware simulation terminal for decentralized QR authentication and cloud sync telemetry.
          </p>
        </div>

        <button
          onClick={() => fetchFogTelemetry(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Polling...' : 'Sync Stream'}</span>
        </button>
      </div>

      {/* Main Node Hardware State Card (Requirement 12) */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(8, 20, 38, 0.95), rgba(12, 28, 52, 0.95))',
        border: '1px solid #0891b2',
        marginBottom: '2rem',
        padding: '1.75rem',
        boxShadow: '0 8px 30px rgba(6, 182, 212, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Server size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  {fogStatus?.fog_node_id || 'FOG-NODE-GATEWAY-01'}
                </h2>
                <span className="badge badge-online">
                  ? {fogStatus?.status || 'ONLINE'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Node Location: <strong>{fogStatus?.location || 'Terminal North Gateway - Local Zone'}</strong>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Processing Architecture</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22d3ee' }}>
              {fogStatus?.processing_mode || 'LOCAL EDGE VALIDATION'}
            </div>
          </div>
        </div>

        {/* Telemetry Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          background: '#090e1a',
          padding: '1.25rem',
          borderRadius: '0.75rem',
          border: '1px solid #1e293b'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Requests Processed</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {fogStatus?.total_requests || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Gate Interactions</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Allowed Entries</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              {fogStatus?.successful_verifications || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Valid Tokens</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Denied Entries</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
              {fogStatus?.rejected_verifications || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Invalid / Expired / Mismatch</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Avg Edge Latency</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
              {fogStatus?.average_processing_time_ms || 22.4} <span style={{ fontSize: '1rem' }}>ms</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sub-50ms Edge Target</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Last Verification</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginTop: '0.5rem' }}>
              {fogStatus?.last_verification_time ? formatDateTime(fogStatus.last_verification_time) : 'Active Ready'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>? Edge Cache Warm</div>
          </div>
        </div>
      </div>

      {/* Real Database Fog Event Logs (Requirement 12) */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Activity size={20} style={{ color: '#06b6d4' }} />
            <span>Live Fog Node Event Stream (Local Processing & Sync Log)</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Chronological audit of edge operations
          </span>
        </div>

        {fogLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
            No Fog events logged yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Processing Details & Message</th>
                  <th>Edge Latency</th>
                  <th>Fog Gateway Node</th>
                </tr>
              </thead>
              <tbody>
                {fogLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.created_at)}
                    </td>
                    <td>{getEventBadge(log.event_type)}</td>
                    <td style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{log.message}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                      {log.processing_time}ms
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {log.fog_node}
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

