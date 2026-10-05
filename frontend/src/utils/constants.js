export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const USER_ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
};

export const SLOT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE'
};

export const VEHICLE_TYPES = ['Car', 'Bike', 'EV'];

export const STATUS_COLORS = {
  AVAILABLE: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '#10b981',
    text: '#34d399',
    badgeClass: 'badge-available'
  },
  RESERVED: {
    bg: 'rgba(245, 158, 11, 0.15)',
    border: '#f59e0b',
    text: '#fbbf24',
    badgeClass: 'badge-reserved'
  },
  OCCUPIED: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#ef4444',
    text: '#f87171',
    badgeClass: 'badge-occupied'
  },
  MAINTENANCE: {
    bg: 'rgba(148, 163, 184, 0.15)',
    border: '#64748b',
    text: '#94a3b8',
    badgeClass: 'badge-maintenance'
  }
};

