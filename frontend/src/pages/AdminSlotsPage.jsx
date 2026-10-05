import React, { useState, useEffect } from 'react';
import {
  Settings2,
  Plus,
  Edit,
  Trash2,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { STATUS_COLORS } from '../utils/constants';

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [currentSlotId, setCurrentSlotId] = useState(null);
  const [slotForm, setSlotForm] = useState({
    slot_code: '',
    floor: 'Floor 1',
    zone: 'Zone A',
    vehicle_type: 'Car',
    status: 'AVAILABLE',
    is_active: true
  });

  const fetchSlots = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await parkingService.getSlots();
      setSlots(data);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const openCreateModal = () => {
    setModalMode('CREATE');
    setCurrentSlotId(null);
    setSlotForm({
      slot_code: '',
      floor: 'Floor 1',
      zone: 'Zone A',
      vehicle_type: 'Car',
      status: 'AVAILABLE',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slot) => {
    setModalMode('EDIT');
    setCurrentSlotId(slot.id);
    setSlotForm({
      slot_code: slot.slot_code,
      floor: slot.floor,
      zone: slot.zone,
      vehicle_type: slot.vehicle_type,
      status: slot.status,
      is_active: slot.is_active
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') {
        await parkingService.createSlot(slotForm);
        setMessage(`Bay ${slotForm.slot_code} created successfully.`);
      } else {
        await parkingService.updateSlot(currentSlotId, slotForm);
        setMessage(`Bay ${slotForm.slot_code} updated successfully.`);
      }
      setIsModalOpen(false);
      fetchSlots();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save slot');
    }
  };

  const handleToggleMaintenance = async (slot) => {
    const newStatus = slot.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await parkingService.updateSlot(slot.id, { status: newStatus });
      setMessage(`Slot ${slot.slot_code} status set to ${newStatus}.`);
      fetchSlots();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update maintenance state');
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Permanently remove bay ${slot.slot_code}?`)) return;
    try {
      await parkingService.deleteSlot(slot.id);
      setMessage(`Slot ${slot.slot_code} deleted.`);
      fetchSlots();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete slot');
    }
  };

  const filtered = slots.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.slot_code.toLowerCase().includes(q) || s.zone.toLowerCase().includes(q) || s.floor.toLowerCase().includes(q);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings2 size={26} style={{ color: '#38bdf8' }} />
            <span>Parking Slot & Bay Configuration</span>
          </h1>
          <p className="page-subtitle">
            Add new parking bays, configure vehicle designations, and toggle maintenance modes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => fetchSlots(true)}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Sync</span>
          </button>
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Add New Bay</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Table */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '300px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search bay code, zone, floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Bay Code</th>
                <th>Floor Level</th>
                <th>Zone</th>
                <th>Vehicle Type</th>
                <th>Current Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                    {s.slot_code}
                  </td>
                  <td>{s.floor}</td>
                  <td style={{ fontWeight: 600, color: '#38bdf8' }}>{s.zone}</td>
                  <td>{s.vehicle_type}</td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[s.status]?.badgeClass || 'badge-available'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: s.is_active ? '#34d399' : '#ef4444', fontWeight: 600, fontSize: '0.8rem' }}>
                      {s.is_active ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openEditModal(s)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Slot Parameters"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleToggleMaintenance(s)}
                        className="btn btn-secondary btn-sm"
                        title={s.status === 'MAINTENANCE' ? 'Clear Maintenance' : 'Set Under Maintenance'}
                        style={{ padding: '0.3rem 0.5rem', color: s.status === 'MAINTENANCE' ? '#fbbf24' : '#94a3b8' }}
                      >
                        <Wrench size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteSlot(s)}
                        className="btn btn-danger btn-sm"
                        title="Delete Slot"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {modalMode === 'CREATE' ? 'Add New Parking Bay' : `Edit Bay ${slotForm.slot_code}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Bay Identifier Code</label>
                <input
                  type="text"
                  required
                  value={slotForm.slot_code}
                  onChange={(e) => setSlotForm({ ...slotForm, slot_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. D01"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Floor Level</label>
                  <select
                    value={slotForm.floor}
                    onChange={(e) => setSlotForm({ ...slotForm, floor: e.target.value })}
                    className="form-select"
                  >
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                    <option value="Floor 3">Floor 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Zone Area</label>
                  <select
                    value={slotForm.zone}
                    onChange={(e) => setSlotForm({ ...slotForm, zone: e.target.value })}
                    className="form-select"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle Designation</label>
                  <select
                    value={slotForm.vehicle_type}
                    onChange={(e) => setSlotForm({ ...slotForm, vehicle_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="EV">EV</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    value={slotForm.status}
                    onChange={(e) => setSlotForm({ ...slotForm, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={slotForm.is_active}
                  onChange={(e) => setSlotForm({ ...slotForm, is_active: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="is_active" style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                  Enable Bay in Public Registry (Active)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <span>{modalMode === 'CREATE' ? 'Create Bay' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
