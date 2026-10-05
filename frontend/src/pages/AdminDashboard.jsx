import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid3X3,
  CheckCircle2,
  Clock,
  Ban,
  Users,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  RefreshCw,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { adminService } from '../services/adminService';
import { useInterval } from '../hooks/useInterval';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [statsData, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading admin analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useInterval(() => {
    loadData(false);
  }, 8000);

  if (loading) {
    return <div className="page-container"><p>Loading system analytics...</p></div>;
  }

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LayoutDashboard size={26} style={{ color: '#38bdf8' }} />
            <span>Executive Analytics & Cloud Telemetry</span>
          </h1>
          <p className="page-subtitle">
            Real-time facility occupancy, Fog Node throughput, and historical reservation trends.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
        </button>
      </div>

      {/* 8 Metric Cards (Requirement 15) */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Grid3X3 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.total_slots || 0}</span>
            <span className="stat-label">Total Bays</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#34d399' }}>{stats?.available_slots || 0}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#fbbf24' }}>{stats?.reserved_slots || 0}</span>
            <span className="stat-label">Reserved</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <Ban size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#f87171' }}>{stats?.occupied_slots || 0}</span>
            <span className="stat-label">Occupied</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.total_users || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.active_reservations || 0}</span>
            <span className="stat-label">Active Bookings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#34d399' }}>{stats?.total_qr_verifications || 0}</span>
            <span className="stat-label">QR Scans Total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#f87171' }}>{stats?.rejected_attempts || 0}</span>
            <span className="stat-label">Denied Attempts</span>
          </div>
        </div>
      </div>

      {/* 4 Recharts Analytics Charts (Requirement 15) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Parking Occupancy Donut */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <PieIcon size={20} style={{ color: '#38bdf8' }} />
              <span>Real-Time Parking Bay Occupancy</span>
            </h2>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={analytics?.occupancy_breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.occupancy_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Reservations Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <BarChart3 size={20} style={{ color: '#34d399' }} />
              <span>Daily Reservation Traffic (Last 7 Days)</span>
            </h2>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={analytics?.daily_reservations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="reservations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: QR Verification Success vs Failure */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <ShieldCheck size={20} style={{ color: '#f59e0b' }} />
              <span>QR Authentication Outcome Ratio</span>
            </h2>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={analytics?.qr_verification_metrics || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.qr_verification_metrics || []).map((entry, index) => (
                    <Cell key={`qr-cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Usage By Zone */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Layers size={20} style={{ color: '#a78bfa' }} />
              <span>Parking Occupancy by Zone</span>
            </h2>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={analytics?.zone_occupancy || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="zone" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="available" fill="#10b981" stackId="a" name="Available" />
                <Bar dataKey="reserved" fill="#f59e0b" stackId="a" name="Reserved" />
                <Bar dataKey="occupied" fill="#ef4444" stackId="a" name="Occupied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
