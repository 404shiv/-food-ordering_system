import api from './api';

export const orderApi = {
  placeOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },
  cancelOrder: async (id) => {
    const res = await api.put(`/orders/${id}/cancel`);
    return res.data;
  },
  getInvoiceBlob: async (id) => {
    const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
    return res.data;
  }
};
