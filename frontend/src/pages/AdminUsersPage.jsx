import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, UserX, Trash2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/formatters';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    const newStatus = !user.is_active;
    try {
      await adminService.updateUser(user.id, { is_active: newStatus });
      setMessage(`User ${user.email} is now ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminService.updateUser(userId, { role: newRole });
      setMessage(`User role updated to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete user ${user.email}? This will remove all their reservation history.`)) {
      return;
    }
    try {
      await adminService.deleteUser(user.id);
      setMessage(`User ${user.email} deleted.`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.vehicle_number && u.vehicle_number.toLowerCase().includes(q));
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={26} style={{ color: '#38bdf8' }} />
            <span>User Management & Authorization</span>
          </h1>
          <p className="page-subtitle">
            Manage user roles, toggle gate privileges, and monitor account registration.
          </p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search name, email, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle Plate</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>#{u.id}</td>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {u.vehicle_number || <span style={{ color: '#64748b' }}>None</span>}
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="form-select"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        width: 'auto',
                        color: u.role === 'ADMIN' ? '#ef4444' : u.role === 'STAFF' ? '#f59e0b' : '#38bdf8'
                      }}
                    >
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-available' : 'badge-occupied'}`}>
                      {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-success'}`}
                        title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="btn btn-danger btn-sm"
                        title="Delete User"
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
    </div>
  );
}
