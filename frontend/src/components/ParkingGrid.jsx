import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, Car, Bike, Zap, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import SlotCard from './SlotCard';
import { STATUS_COLORS } from '../utils/constants';

export default function ParkingGrid({ slots = [], onSlotSelect, selectedSlotId, showBookingModal = true }) {
  const navigate = useNavigate();
  const [activeZone, setActiveZone] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSlot, setModalSlot] = useState(null);

  const zones = ['ALL', 'Zone A', 'Zone B', 'Zone C'];

  const filteredSlots = slots.filter((slot) => {
    if (activeZone !== 'ALL' && slot.zone !== activeZone) return false;
    if (vehicleFilter !== 'ALL' && slot.vehicle_type !== vehicleFilter) return false;
    if (statusFilter !== 'ALL' && slot.status !== statusFilter) return false;
    if (searchQuery && !slot.slot_code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSlotClick = (slot) => {
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
    if (showBookingModal) {
      setModalSlot(slot);
    }
  };

  const handleBookNow = (slot) => {
    setModalSlot(null);
    navigate(`/reserve?slot_id=${slot.id}`);
  };

  // Group filtered slots by Zone
  const groupedByZone = {
    'Zone A': filteredSlots.filter((s) => s.zone === 'Zone A'),
    'Zone B': filteredSlots.filter((s) => s.zone === 'Zone B'),
    'Zone C': filteredSlots.filter((s) => s.zone === 'Zone C')
  };

  return (
    <div>
      {/* Filters bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Zone tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginRight: '0.25rem' }}>
              Zone:
            </span>
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setActiveZone(z)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: activeZone === z ? '#2563eb' : '#1e293b',
                  color: activeZone === z ? '#fff' : '#94a3b8',
                  border: activeZone === z ? '1px solid #3b82f6' : '1px solid #334155'
                }}
              >
                {z === 'ALL' ? 'All Zones' : z}
              </button>
            ))}
          </div>

          {/* Type, Status & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '130px' }}>
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '10px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Slot (e.g. A01)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.5rem 0.35rem 1.75rem', fontSize: '0.8rem' }}
              />
            </div>

            {/* Vehicle Type */}
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Types</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="EV">EV</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {filteredSlots.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', color: '#64748b' }} />
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>No Parking Slots Found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try adjusting your search query or filters.</div>
        </div>
      ) : activeZone === 'ALL' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(groupedByZone).map(([zoneName, zoneSlots]) => {
            if (zoneSlots.length === 0) return null;
            return (
              <div key={zoneName} className="card" style={{ background: '#0e1626' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #1f2937'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                      {zoneName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      ({zoneSlots.filter((s) => s.status === 'AVAILABLE').length} Available / {zoneSlots.length} Total)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {zoneSlots[0]?.floor} • {zoneSlots[0]?.vehicle_type} Designated
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.875rem'
                }}>
                  {zoneSlots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlotId === slot.id}
                      onSelect={handleSlotClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
            gap: '1rem'
          }}>
            {filteredSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isSelected={selectedSlotId === slot.id}
                onSelect={handleSlotClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Slot details modal */}
      {modalSlot && (
        <div className="modal-overlay" onClick={() => setModalSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                  Slot {modalSlot.slot_code}
                </span>
                <span className={`badge ${STATUS_COLORS[modalSlot.status]?.badgeClass || 'badge-reserved'}`}>
                  {modalSlot.status}
                </span>
              </div>
              <button
                onClick={() => setModalSlot(null)}
                style={{ color: '#94a3b8', padding: '0.25rem', borderRadius: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#0b1120', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid #1f2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Floor Level:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{modalSlot.floor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Zone:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{modalSlot.zone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Supported Vehicle:</span>
                <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem' }}>{modalSlot.vehicle_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Operating State:</span>
                <span style={{ fontWeight: 600, color: modalSlot.is_active ? '#34d399' : '#ef4444', fontSize: '0.85rem' }}>
                  {modalSlot.is_active ? 'Active' : 'Deactivated'}
                </span>
              </div>
            </div>

            {modalSlot.status === 'AVAILABLE' && modalSlot.is_active ? (
              <button
                onClick={() => handleBookNow(modalSlot)}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.5rem' }}
              >
                <span>Reserve Slot {modalSlot.slot_code}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                fontSize: '0.85rem'
              }}>
                {modalSlot.status === 'MAINTENANCE' || !modalSlot.is_active
                  ? 'This slot is currently under maintenance or inactive.'
                  : `This slot is currently ${modalSlot.status.toLowerCase()} and cannot be reserved.`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
