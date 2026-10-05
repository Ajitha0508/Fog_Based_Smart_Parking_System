import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid3X3,
  CalendarPlus,
  History,
  QrCode,
  ScanLine,
  CarFront,
  Users,
  Settings2,
  ListOrdered,
  Cpu,
  FileSpreadsheet,
  ShieldAlert,
  Shield,
  Wrench,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FogStatusBadge from './FogStatusBadge';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#fff' : '#94a3b8',
    background: isActive ? '#1e293b' : 'transparent',
    borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
    transition: 'all 0.15s ease',
    marginBottom: '0.25rem'
  });

  const renderAdminSection = () => (
    <div>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#ef4444',
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        padding: '0 0.5rem 0.5rem 0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}>
        <Shield size={13} />
        <span>Admin Console</span>
        <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)' }}>ADMIN</span>
      </div>
      <nav>
        <NavLink to="/admin" end style={navLinkStyle}>
          <LayoutDashboard size={18} />
          <span>Admin Analytics</span>
        </NavLink>
        <NavLink to="/admin/users" style={navLinkStyle}>
          <Users size={18} />
          <span>User Management</span>
        </NavLink>
        <NavLink to="/admin/slots" style={navLinkStyle}>
          <Settings2 size={18} />
          <span>Slot Management</span>
        </NavLink>
        <NavLink to="/admin/reservations" style={navLinkStyle}>
          <ListOrdered size={18} />
          <span>All Reservations</span>
        </NavLink>
        <NavLink to="/admin/fog" style={navLinkStyle}>
          <Cpu size={18} />
          <span>Fog Node Monitor</span>
        </NavLink>
        <NavLink to="/admin/logs" style={navLinkStyle}>
          <FileSpreadsheet size={18} />
          <span>QR Audit Logs</span>
        </NavLink>
      </nav>
    </div>
  );

  const renderStaffSection = () => (
    <div>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#f59e0b',
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        padding: '0 0.5rem 0.5rem 0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}>
        <Wrench size={13} />
        <span>Staff Gate Desk</span>
        <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.2)' }}>STAFF</span>
      </div>
      <nav>
        <NavLink to="/staff" end style={navLinkStyle}>
          <LayoutDashboard size={18} />
          <span>Staff Desk</span>
        </NavLink>
        <NavLink to="/staff/scan" style={navLinkStyle}>
          <ScanLine size={18} />
          <span>Scan QR Entry</span>
        </NavLink>
        <NavLink to="/staff/active-parking" style={navLinkStyle}>
          <CarFront size={18} />
          <span>Active Parking & Exit</span>
        </NavLink>
      </nav>
    </div>
  );

  const renderUserSection = () => (
    <div>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#38bdf8',
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        padding: '0 0.5rem 0.5rem 0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}>
        <UserIcon size={13} />
        <span>User Services</span>
      </div>
      <nav>
        <NavLink to="/dashboard" style={navLinkStyle}>
          <LayoutDashboard size={18} />
          <span>My Dashboard</span>
        </NavLink>
        <NavLink to="/parking" style={navLinkStyle}>
          <Grid3X3 size={18} />
          <span>Parking Slots</span>
        </NavLink>
        <NavLink to="/reserve" style={navLinkStyle}>
          <CalendarPlus size={18} />
          <span>Book Slot</span>
        </NavLink>
        <NavLink to="/my-reservations" style={navLinkStyle}>
          <History size={18} />
          <span>My Reservations</span>
        </NavLink>
        <NavLink to="/my-qr" style={navLinkStyle}>
          <QrCode size={18} />
          <span>My Active QR</span>
        </NavLink>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 45,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: isOpen ? '260px' : '0',
        minWidth: isOpen ? '260px' : '0',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid #1f2937',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isOpen ? '1.25rem 0.875rem' : '0',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          {/* Dynamically order sections based on the logged in role */}
          {role === 'ADMIN' && (
            <>
              {renderAdminSection()}
              {renderStaffSection()}
              {renderUserSection()}
            </>
          )}

          {role === 'STAFF' && (
            <>
              {renderStaffSection()}
              {renderUserSection()}
            </>
          )}

          {role !== 'ADMIN' && role !== 'STAFF' && (
            <>
              {renderUserSection()}
            </>
          )}
        </div>

        {/* Bottom edge node box */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #1f2937' }}>
          <FogStatusBadge compact={false} />
        </div>
      </aside>
    </>
  );
}
