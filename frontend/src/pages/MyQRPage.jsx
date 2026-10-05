import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Copy, Check, Car, MapPin, Clock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { reservationService } from '../services/reservationService';
import { qrService } from '../services/qrService';
import { formatDateTime, truncateToken } from '../utils/formatters';

export default function MyQRPage() {
  const [reservations, setReservations] = useState([]);
  const [selectedResId, setSelectedResId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const list = await reservationService.getMyReservations();
        setReservations(list);
        
        // Pick first active or confirmed reservation
        const active = list.find((r) => r.status === 'CONFIRMED' || r.status === 'USED') || list[0];
        if (active) {
          setSelectedResId(active.id);
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!selectedResId) return;
    const fetchQR = async () => {
      try {
        const data = await qrService.getQR(selectedResId);
        setQrData(data);
      } catch (err) {
        console.error('Error loading QR details:', err);
      }
    };
    fetchQR();
  }, [selectedResId]);

  const handleCopy = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.qr_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (qrData?.qr_code_base64) {
      const link = document.createElement('a');
      link.href = qrData.qr_code_base64;
      link.download = `QR-${qrData.reservation_code || 'pass'}.png`;
      link.click();
    } else {
      const svg = document.getElementById('qr-code-view-svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = `QR-${qrData?.reservation_code || 'pass'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  if (loading) {
    return <div className="page-container"><p>Loading digital pass...</p></div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <AlertCircle size={44} style={{ color: '#38bdf8', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>No QR Passes Found</h2>
          <p style={{ color: '#94a3b8', margin: '0.75rem 0 1.5rem 0' }}>
            You haven't reserved any parking slots yet. Book a slot now to receive your encrypted QR pass.
          </p>
          <Link to="/reserve" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <span>Book a Parking Slot</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <div>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <QrCode size={26} style={{ color: '#38bdf8' }} />
            <span>Digital QR Parking Pass</span>
          </h1>
          <p className="page-subtitle">
            Present this QR pass to the Gate Scanner upon arrival.
          </p>
        </div>
      </div>

      {/* Selector if multiple reservations */}
      {reservations.length > 1 && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
              Select Reservation:
            </span>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '240px', fontSize: '0.85rem' }}
            >
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reservation_code} — Slot {r.slot?.slot_code || r.slot_id} ({r.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {qrData && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          {/* Header Code & Status */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
              {qrData.reservation_code}
            </span>
            <span className={`badge ${qrData.status === 'CONFIRMED' ? 'badge-reserved' : qrData.status === 'USED' ? 'badge-occupied' : qrData.status === 'COMPLETED' ? 'badge-available' : 'badge-maintenance'}`}>
              {qrData.status}
            </span>
          </div>

          {/* QR Code Container */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'inline-block',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            marginBottom: '1.75rem'
          }}>
            <QRCodeSVG
              id="qr-code-view-svg"
              value={qrData.qr_payload || JSON.stringify({ reservation_id: qrData.reservation_code, token: qrData.qr_token })}
              size={240}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Details Grid */}
          <div style={{
            background: '#0b1120',
            border: '1px solid #1f2937',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.75rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Assigned Bay
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  Slot {qrData.slot_code}
                </strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {qrData.floor} • {qrData.zone}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Registered Vehicle
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  {qrData.vehicle_number}
                </strong>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                  {qrData.vehicle_type}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Entry Schedule
                </span>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                  {formatDateTime(qrData.entry_time)}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Expected Exit
                </span>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                  {formatDateTime(qrData.expected_exit_time)}
                </span>
              </div>
            </div>

            {/* Token copy strip */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                Token: {truncateToken(qrData.qr_token, 20)}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: copied ? '#34d399' : '#38bdf8',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleDownload}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, gap: '0.6rem' }}
            >
              <Download size={18} />
              <span>Download High-Res QR</span>
            </button>
            <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
