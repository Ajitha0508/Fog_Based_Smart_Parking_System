import api from './api';

export const qrService = {
  async getQR(reservationId) {
    const res = await api.get(`/qr/${reservationId}`);
    return res.data;
  },

  async generateQR(reservationId) {
    const res = await api.post(`/qr/generate?reservation_id=${reservationId}`);
    return res.data;
  }
};
