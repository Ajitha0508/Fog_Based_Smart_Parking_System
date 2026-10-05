import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, RefreshCw, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { fogService } from '../services/fogService';
import { formatDateTime } from '../utils/formatters';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await fogService.getQRLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching QR logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const vehMatch = l.vehicle_number && l.vehicle_number.toLowerCase().includes(q);
      const slotMatch = l.slot_code && l.slot_code.toLowerCase().includes(q);
      const statMatch = l.verification_status && l.verification_status.toLowerCase().includes(q);
      const detMatch = l.details && l.details.toLowerCase().includes(q);
      if (!vehMatch && !slotMatch && !statMatch && !detMatch) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileSpreadsheet size={26} style={{ color: '#38bdf8' }} />
            <span>QR Authentication Audit Trail</span>
          </h1>
          <p className="page-subtitle">
            Permanent ledger of every QR authentication attempt received by the local Fog Node.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'ENTRY_ALLOWED', 'ENTRY_DENIED'].map((action) => (
              <button
                key={action}
                onClick={() => setActionFilter(action)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: actionFilter === action ? '#2563eb' : '#1e293b',
                  color: actionFilter === action ? '#fff' : '#94a3b8',
                  border: actionFilter === action ? '1px solid #3b82f6' : '1px solid #334155'
                }}
              >
                {action === 'ALL' ? 'All Outcomes' : action}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search license, slot, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Vehicle Number</th>
                <th>Slot Bay</th>
                <th>QR Status</th>
                <th>Fog Action</th>
                <th>Fog Node Terminal</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8', fontSize: '0.8rem' }}>
                    #{log.id}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {log.vehicle_number || <span style={{ color: '#64748b' }}>None</span>}
                  </td>
                  <td style={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {log.slot_code || (log.slot_id ? `Slot #${log.slot_id}` : '—')}
                  </td>
                  <td>
                    <span className={`badge ${log.verification_status === 'SUCCESS' ? 'badge-available' : 'badge-occupied'}`}>
                      {log.verification_status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: log.action === 'ENTRY_ALLOWED' ? '#34d399' : '#f87171'
                    }}>
                      {log.action === 'ENTRY_ALLOWED' ? '✓ ENTRY_ALLOWED' : '✗ ENTRY_DENIED'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {log.fog_node}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    {log.details || 'Edge authentication evaluated'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
