import React, { useState, useEffect } from 'react';
import { Server, Activity, ShieldCheck } from 'lucide-react';
import { fogService } from '../services/fogService';
import { useInterval } from '../hooks/useInterval';

export default function FogStatusBadge({ compact = false }) {
  const [fogStatus, setFogStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await fogService.getFogStatus();
      setFogStatus(data);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useInterval(fetchStatus, 15000); // refresh every 15s

  if (compact) {
    return (
      <div 
        title="Edge Fog Node Status"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          background: isOnline ? 'rgba(6, 182, 212, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: isOnline ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: isOnline ? '#22d3ee' : '#f87171',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)'
        }}
      >
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isOnline ? '#22d3ee' : '#ef4444',
          boxShadow: isOnline ? '0 0 6px #22d3ee' : 'none'
        }} />
        <span>FOG: {isOnline ? 'ONLINE' : 'OFFLINE'}</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0.875rem',
      borderRadius: '0.5rem',
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid #1e293b'
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        background: 'rgba(6, 182, 212, 0.15)',
        color: '#22d3ee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Server size={16} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
            {fogStatus?.fog_node_id || 'FOG-NODE-GATEWAY-01'}
          </span>
          <span style={{
            fontSize: '0.65rem',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            fontWeight: 700
          }}>
            EDGE
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
          Local Edge Validation • {fogStatus?.average_processing_time_ms || 22}ms
        </span>
      </div>
    </div>
  );
}

