import api from './api';

export const reservationService = {
  async createReservation(data) {
    const res = await api.post('/reservations', data);
    return res.data;
  },

  async getMyReservations() {
    const res = await api.get('/reservations/my');
    return res.data;
  },

  async getAllReservations() {
    const res = await api.get('/reservations');
    return res.data;
  },

  async getReservation(id) {
    const res = await api.get(`/reservations/${id}`);
    return res.data;
  },

  async cancelReservation(id) {
    const res = await api.put(`/reservations/${id}/cancel`);
    return res.data;
  }
};
