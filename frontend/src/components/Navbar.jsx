import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, User as UserIcon, Shield, Radio, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FogStatusBadge from './FogStatusBadge';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '64px',
      background: 'rgba(13, 19, 31, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            style={{
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: '0.375rem',
              background: '#1e293b'
            }}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <Link to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : user?.role === 'STAFF' ? '/staff' : '/dashboard') : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)'
          }}>
            <Car size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              SMART <span style={{ color: '#38bdf8' }}>PARKING</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
              FOG COMPUTING & SECURE QR
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FogStatusBadge compact={true} />

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              background: '#162032',
              border: '1px solid #1f2937'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: user?.role === 'ADMIN' ? '#dc2626' : user?.role === 'STAFF' ? '#d97706' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.1 }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Log Out"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

