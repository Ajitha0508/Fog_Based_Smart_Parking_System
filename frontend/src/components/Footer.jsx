import React from 'react';
import { Cpu, ShieldCheck, Database, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #1f2937',
      background: 'rgba(11, 17, 32, 0.95)',
      padding: '2rem 1.5rem',
      color: '#64748b',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
            Fog Computing-Based Intelligent Parking & Secure Slot Reservation System
          </div>
          <div>
            Decentralized Edge QR Authentication Gateway & Real-Time Cloud Synchronization
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Note: All IoT sensors and edge gateways run as robust local software simulations.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8' }}>
            <Cpu size={16} />
            <span>FastAPI Edge Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
            <ShieldCheck size={16} />
            <span>Encrypted QR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa' }}>
            <Database size={16} />
            <span>SQLite & SQLAlchemy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
            <Zap size={16} />
            <span>React & Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

