import api from './api';

export const parkingService = {
  async getSlots(filters = {}) {
    const params = new URLSearchParams();
    if (filters.floor) params.append('floor', filters.floor);
    if (filters.zone) params.append('zone', filters.zone);
    if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.active_only) params.append('active_only', 'true');

    const res = await api.get(`/parking/slots?${params.toString()}`);
    return res.data;
  },

  async getSlot(id) {
    const res = await api.get(`/parking/slots/${id}`);
    return res.data;
  },

  async createSlot(slotData) {
    const res = await api.post('/parking/slots', slotData);
    return res.data;
  },

  async updateSlot(id, slotData) {
    const res = await api.put(`/parking/slots/${id}`, slotData);
    return res.data;
  },

  async deleteSlot(id) {
    const res = await api.delete(`/parking/slots/${id}`);
    return res.data;
  }
};
