import api from './api';

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async updateUser(id, data) {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  }
};
