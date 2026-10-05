import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  CheckCircle2,
  Server,
  Zap,
  Lock,
  Layers,
  Activity,
  ChevronRight,
  Database
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import FogStatusBadge from '../components/FogStatusBadge';

export default function LandingPage() {
  const [stats, setStats] = useState({ total: 30, available: 26, occupied: 2, reserved: 2 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const slots = await parkingService.getSlots();
        const available = slots.filter((s) => s.status === 'AVAILABLE').length;
        const occupied = slots.filter((s) => s.status === 'OCCUPIED').length;
        const reserved = slots.filter((s) => s.status === 'RESERVED').length;
        setStats({ total: slots.length, available, occupied, reserved });
      } catch (e) {
        // Fallback demo numbers
      }
    };
    loadStats();
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(37, 99, 235, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Cpu size={15} />
          <span>Decentralized Edge Fog Architecture with Sub-50ms QR Verification</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#fff',
          maxWidth: '950px',
          marginBottom: '1.5rem'
        }}>
          Intelligent Parking Management with <span style={{ color: '#38bdf8' }}>Fog Computing</span> and <span style={{ color: '#34d399' }}>Secure QR</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#94a3b8',
          maxWidth: '750px',
          lineHeight: 1.6,
          marginBottom: '2.5rem'
        }}>
          Reserve parking slots in real time, receive cryptographically protected QR passes, and enjoy seamless, low-latency access verified locally by simulated edge Fog nodes before synchronization with the central database.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <Link to="/parking" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
            <span>Find Parking Slots</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            <span>Operator / Staff Login</span>
          </Link>
        </div>

        {/* Live System Counter Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '900px',
          background: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{stats.total}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Slots</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{stats.available}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Available Now</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{stats.reserved}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Reserved</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>{stats.occupied}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Occupied</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 2rem', background: '#0a0f1d', borderTop: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Simple 4-Step Process
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              How The System Works
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(37, 99, 235, 0.4)', marginBottom: '0.5rem' }}>01</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Select & Reserve</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Browse live interactive parking maps by zone and vehicle type (Car, Bike, EV). Choose an available slot and specify entry time.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #06b6d4' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(6, 182, 212, 0.4)', marginBottom: '0.5rem' }}>02</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Generate Secure QR</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Upon confirmation, the system creates an encrypted reservation token embedded into a unique digital QR pass.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #10b981' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(16, 185, 129, 0.4)', marginBottom: '0.5rem' }}>03</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Fog Edge Verification</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Staff scans the QR at the gateway. The local Fog Node authenticates the token in milliseconds and unlocks the barrier.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(245, 158, 11, 0.4)', marginBottom: '0.5rem' }}>04</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Automated Departure</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                When leaving, staff marks vehicle exit. The slot instantly returns to AVAILABLE and logs are synced to the central database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Workflow Visualization (Requirement 22) */}
      <section style={{ padding: '4rem 2rem', background: '#070b14', borderTop: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Technical Architecture
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              Fog Computing Authentication Pipeline
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              High-throughput edge processing prevents gate bottlenecks and guarantees continuous operation.
            </p>
          </div>

          <div className="card" style={{ background: '#0e1628', padding: '2rem' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', minWidth: '150px' }}>
                <Car size={24} style={{ color: '#38bdf8', margin: '0 auto 0.4rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>User Vehicle</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Arrives at Gate</div>
              </div>

              <ChevronRight size={20} style={{ color: '#64748b' }} />

              <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', minWidth: '150px' }}>
                <ShieldCheck size={24} style={{ color: '#34d399', margin: '0 auto 0.4rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>QR Scanner</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Camera / Token</div>
              </div>

              <ChevronRight size={20} style={{ color: '#64748b' }} />

              <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                border: '2px solid #06b6d4',
                minWidth: '220px',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
              }}>
                <Cpu size={28} style={{ color: '#06b6d4', margin: '0 auto 0.4rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Fog Node Gateway</div>
                <div style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 600 }}>Local Edge Validation</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>Token • Status • Plate Match</div>
              </div>

              <ChevronRight size={20} style={{ color: '#64748b' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '0.6rem 1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#34d399' }}>? ENTRY ALLOWED</div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Slot State ? OCCUPIED</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '0.6rem 1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171' }}>? ENTRY DENIED</div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Expired / Tampered / Mismatch</div>
                </div>
              </div>

              <ChevronRight size={20} style={{ color: '#64748b' }} />

              <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', minWidth: '150px' }}>
                <Database size={24} style={{ color: '#a78bfa', margin: '0 auto 0.4rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Central Cloud Sync</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Audit Logs & Telemetry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section style={{ padding: '4rem 2rem', background: '#0a0f1d', borderTop: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Production Features
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              Engineered For Reliability & Speed
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Simulated Fog Computing</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Simulates dedicated edge gate terminals performing microsecond local token validation, plate cross-checking, and resilient synchronization with the central database.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Secure QR Tokens</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
                High-entropy cryptographically generated tokens prevent counterfeiting. Replay attacks and reuse of consumed QR codes are blocked at the edge.
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Anti-Collision Slot Locking</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Atomic database transactions ensure that two simultaneous users cannot book the same parking slot, preventing double-booking errors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #090d16 0%, #0d1527 100%)',
        borderTop: '1px solid #1f2937'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Experience The Smart Parking Platform
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Test user bookings, staff camera scanning, and admin Fog Node analytics immediately on localhost.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create User Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Try Demo Accounts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

