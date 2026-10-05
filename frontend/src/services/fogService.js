import api from './api';

export const fogService = {
  async verifyQR(qrToken, scannedVehicleNumber = null) {
    const res = await api.post('/fog/verify-qr', {
      qr_token: qrToken,
      scanned_vehicle_number: scannedVehicleNumber
    });
    return res.data;
  },

  async vehicleExit(slotId = null, reservationId = null) {
    const res = await api.post('/fog/vehicle-exit', {
      slot_id: slotId,
      reservation_id: reservationId
    });
    return res.data;
  },

  async getFogStatus() {
    const res = await api.get('/fog/status');
    return res.data;
  },

  async getFogLogs(limit = 50) {
    const res = await api.get(`/fog/logs?limit=${limit}`);
    return res.data;
  },

  async getQRLogs(limit = 50) {
    const res = await api.get(`/fog/qr-logs?limit=${limit}`);
    return res.data;
  }
};
