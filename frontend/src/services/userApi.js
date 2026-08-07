import api from './api';

export const userApi = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  updateUserRole: async (userId, data) => {
    const res = await api.put(`/users/${userId}`, data);
    return res.data;
  }
};
