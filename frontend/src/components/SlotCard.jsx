import React from 'react';
import { Car, Bike, Zap, CheckCircle2, Clock, Ban, Wrench } from 'lucide-react';
import { STATUS_COLORS } from '../utils/constants';

export default function SlotCard({ slot, onSelect, isSelected = false }) {
  const getVehicleIcon = (type) => {
    switch (type) {
      case 'Bike':
        return <Bike size={16} />;
      case 'EV':
        return <Zap size={16} />;
      case 'Car':
      default:
        return <Car size={16} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle2 size={13} />;
      case 'RESERVED':
        return <Clock size={13} />;
      case 'OCCUPIED':
        return <Ban size={13} />;
      case 'MAINTENANCE':
      default:
        return <Wrench size={13} />;
    }
  };

  const statusStyle = STATUS_COLORS[slot.status] || STATUS_COLORS.MAINTENANCE;
  const isAvailable = slot.status === 'AVAILABLE' && slot.is_active;

  return (
    <div
      onClick={() => onSelect && onSelect(slot)}
      style={{
        background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-card)',
        border: `2px solid ${isSelected ? '#3b82f6' : statusStyle.border}`,
        borderRadius: '0.625rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        transform: isSelected ? 'scale(1.02)' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none',
        position: 'relative'
      }}
      className="slot-card-interactive"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.025em'
        }}>
          {slot.slot_code}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.45rem',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#38bdf8',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          {getVehicleIcon(slot.vehicle_type)}
          <span>{slot.vehicle_type}</span>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        <span>{slot.floor}</span> • <span>{slot.zone}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge ${statusStyle.badgeClass}`}>
          {getStatusIcon(slot.status)}
          <span>{slot.status}</span>
        </span>

        {isAvailable && onSelect && (
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
            {isSelected ? 'Selected' : 'Book'}
          </span>
        )}
      </div>
    </div>
  );
}
