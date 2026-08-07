import api from './api';

export const analyticsApi = {
  getDashboardStats: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  }
};
