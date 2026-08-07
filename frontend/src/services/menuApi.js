import api from './api';

export const menuApi = {
  getMenuItems: async (params = {}) => {
    const res = await api.get('/menu', { params });
    return res.data;
  },
  getMenuItemById: async (id) => {
    const res = await api.get(`/menu/${id}`);
    return res.data;
  },
  createMenuItem: async (data) => {
    const res = await api.post('/menu', data);
    return res.data;
  },
  updateMenuItem: async (id, data) => {
    const res = await api.put(`/menu/${id}`, data);
    return res.data;
  },
  deleteMenuItem: async (id) => {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  }
};
