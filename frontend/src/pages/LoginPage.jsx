import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Car, AlertCircle, Shield, User, Wrench, Eye, EyeOff, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => localStorage.getItem('saved_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  // Automatically redirect if already logged in so the user is never asked again!
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const performLogin = async (loginEmail, loginPassword) => {
    setError(null);
    setLoading(true);

    try {
      const user = await login(loginEmail, loginPassword);
      // Role-based smart redirection
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    performLogin(demoEmail, demoPassword);
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at top, #111d33 0%, #090d16 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
          }}>
            <Car size={28} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em' }}>
            Smart Parking Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Enter your credentials or choose a role below to sign in
          </p>
        </div>

        {isExpired && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>Your session has expired. Please log in again to continue.</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Password Reminder Banner */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: '#38bdf8',
          fontSize: '0.85rem'
        }}>
          <KeyRound size={18} style={{ flexShrink: 0 }} />
          <div>
            Password for all demo accounts: <strong style={{ color: '#fff', letterSpacing: '0.03em' }}>Password123!</strong>
          </div>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartparking.com"
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem'
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password123!"
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#38bdf8', fontWeight: 600 }}>
              Register here
            </Link>
          </div>
        </div>

        {/* 1-Click Fast Role Sign-in Cards */}
        <div className="card" style={{ background: '#0a0f1d', border: '1px solid #1e293b', padding: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Sparkles size={14} style={{ color: '#38bdf8' }} />
              <span>1-Click Test Login by Role</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Click to enter</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* USER CARD */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(37, 99, 235, 0.2)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                    User / Driver
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    user@smartparking.com
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => fillCredentials('user@smartparking.com', 'Password123!')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                >
                  Fill
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('user@smartparking.com', 'Password123!')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', background: '#2563eb' }}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* STAFF CARD */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(217, 119, 6, 0.2)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wrench size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                    Parking Staff
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    staff@smartparking.com
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => fillCredentials('staff@smartparking.com', 'Password123!')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                >
                  Fill
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('staff@smartparking.com', 'Password123!')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', background: '#d97706' }}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* ADMIN CARD */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                    System Admin
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    admin@smartparking.com
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@smartparking.com', 'Password123!')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                >
                  Fill
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('admin@smartparking.com', 'Password123!')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', background: '#dc2626' }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
