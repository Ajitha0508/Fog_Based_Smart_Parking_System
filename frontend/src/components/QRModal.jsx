import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check, Car, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { formatDateTime, truncateToken } from '../utils/formatters';

export default function QRModal({ qrData, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!qrData) return null;

  const handleCopy = () => {
    const textToCopy = qrData.qr_token || (typeof qrData.qr_payload === 'string' ? qrData.qr_payload : JSON.stringify(qrData.qr_payload));
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (qrData.qr_code_base64) {
      const link = document.createElement('a');
      link.href = qrData.qr_code_base64;
      link.download = `QR-${qrData.reservation_code || 'pass'}.png`;
      link.click();
    } else {
      const svg = document.getElementById('qr-code-svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `QR-${qrData.reservation_code || 'pass'}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  const payloadString = qrData.qr_payload || JSON.stringify({
    reservation_id: qrData.reservation_code,
    token: qrData.qr_token
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Entry QR Pass
            </span>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* QR Code Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          display: 'inline-block',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          marginBottom: '1.25rem'
        }}>
          <QRCodeSVG
            id="qr-code-svg"
            value={payloadString}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Reservation details banner */}
        <div style={{
          background: '#0b1120',
          border: '1px solid #1f2937',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'left',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', fontSize: '1rem' }}>
              {qrData.reservation_code}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              textTransform: 'uppercase'
            }}>
              {qrData.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} style={{ color: '#64748b' }} />
              <span>Slot: <strong style={{ color: '#fff' }}>{qrData.slot_code}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Car size={14} style={{ color: '#64748b' }} />
              <span>Vehicle: <strong style={{ color: '#fff' }}>{qrData.vehicle_number}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', gridColumn: 'span 2' }}>
              <Clock size={14} style={{ color: '#64748b' }} />
              <span>Entry: <strong style={{ color: '#fff' }}>{formatDateTime(qrData.entry_time)}</strong></span>
            </div>
          </div>

          {/* Token snippet */}
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              Token: {truncateToken(qrData.qr_token, 18)}
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: copied ? '#34d399' : '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownload}
            className="btn btn-primary"
            style={{ flex: 1, gap: '0.5rem' }}
          >
            <Download size={16} />
            <span>Download QR</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
