import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export default function QRScanner({ onVerify, isProcessing = false }) {
  const [mode, setMode] = useState('manual'); // 'camera' or 'manual'
  const [manualToken, setManualToken] = useState('');
  const [scannedVehicle, setScannedVehicle] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  const qrScannerRef = useRef(null);
  const scannerContainerId = 'reader-container';

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode(scannerContainerId);
      }
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await qrScannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Success callback
          stopCamera();
          handleDirectVerify(decodedText);
        },
        (errorMessage) => {
          // Silent scan frame mismatch
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera failed to start:', err);
      setCameraError('Camera access unavailable or blocked. Please use Manual Token Entry below.');
      setCameraActive(false);
      setMode('manual');
    }
  };

  const stopCamera = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
      } catch (e) {
        console.error('Error stopping camera:', e);
      }
    }
    setCameraActive(false);
  };

  const toggleMode = (newMode) => {
    if (newMode === 'manual' && cameraActive) {
      stopCamera();
    }
    setMode(newMode);
    if (newMode === 'camera') {
      startCamera();
    }
  };

  const handleDirectVerify = (token) => {
    if (!token) return;
    onVerify(token.trim(), scannedVehicle.trim() || null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    onVerify(manualToken.trim(), scannedVehicle.trim() || null);
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Mode toggle bar */}
      <div style={{
        display: 'flex',
        borderRadius: '0.5rem',
        background: '#0b1120',
        padding: '0.25rem',
        marginBottom: '1.25rem',
        border: '1px solid #1f2937'
      }}>
        <button
          type="button"
          onClick={() => toggleMode('camera')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.6rem',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: mode === 'camera' ? '#2563eb' : 'transparent',
            color: mode === 'camera' ? '#fff' : '#94a3b8',
            transition: 'all 0.15s ease'
          }}
        >
          <Camera size={16} />
          <span>Camera Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => toggleMode('manual')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.6rem',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: mode === 'manual' ? '#2563eb' : 'transparent',
            color: mode === 'manual' ? '#fff' : '#94a3b8',
            transition: 'all 0.15s ease'
          }}
        >
          <Keyboard size={16} />
          <span>Manual QR Token Entry</span>
        </button>
      </div>

      {/* Camera View */}
      {mode === 'camera' && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div
            id={scannerContainerId}
            style={{
              width: '100%',
              minHeight: '280px',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: '#020617',
              border: '2px dashed #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />

          {cameraError && (
            <div className="alert alert-danger" style={{ marginTop: '0.75rem', textAlign: 'left' }}>
              <AlertTriangle size={18} />
              <span>{cameraError}</span>
            </div>
          )}

          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {!cameraActive ? (
              <button onClick={startCamera} className="btn btn-primary btn-sm">
                <Camera size={15} />
                <span>Start Camera</span>
              </button>
            ) : (
              <button onClick={stopCamera} className="btn btn-secondary btn-sm">
                <CameraOff size={15} />
                <span>Stop Camera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Token Form */}
      <form onSubmit={handleManualSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>QR Token or Scanned JSON Payload:</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Required</span>
          </label>
          <textarea
            rows={3}
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder='Paste raw QR token string or JSON payload: { "reservation_id": "RES-...", "token": "..." }'
            className="form-textarea"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Physical Vehicle License Plate (Optional Verification):</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>e.g. KA-01-AB-1234</span>
          </label>
          <input
            type="text"
            value={scannedVehicle}
            onChange={(e) => setScannedVehicle(e.target.value)}
            placeholder="Leave empty to verify by token only, or enter plate number"
            className="form-input"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing || !manualToken.trim()}
          className="btn btn-primary"
          style={{ width: '100%', gap: '0.5rem', padding: '0.75rem' }}
        >
          <Cpu size={18} />
          <span>{isProcessing ? 'Verifying at Fog Node...' : 'Verify Entry through Fog Node'}</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}

