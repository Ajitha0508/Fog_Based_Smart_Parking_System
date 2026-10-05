import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User Pages
import UserDashboard from './pages/UserDashboard';
import ParkingSlotsPage from './pages/ParkingSlotsPage';
import ReserveSlotPage from './pages/ReserveSlotPage';
import MyReservationsPage from './pages/MyReservationsPage';
import MyQRPage from './pages/MyQRPage';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffScanPage from './pages/StaffScanPage';
import StaffActiveParkingPage from './pages/StaffActiveParkingPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSlotsPage from './pages/AdminSlotsPage';
import AdminReservationsPage from './pages/AdminReservationsPage';
import AdminFogPage from './pages/AdminFogPage';
import AdminLogsPage from './pages/AdminLogsPage';

function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Pages that don't need the dashboard sidebar
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);
  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parking"
              element={
                <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                  <ParkingSlotsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reserve"
              element={
                <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                  <ReserveSlotPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reservations"
              element={
                <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                  <MyReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-qr"
              element={
                <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                  <MyQRPage />
                </ProtectedRoute>
              }
            />

            {/* Parking Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/scan"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/active-parking"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffActiveParkingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/slots"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSlotsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fog"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminFogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

