import api from './api';

export const couponApi = {
  getCoupons: async () => {
    const res = await api.get('/coupons');
    return res.data;
  },
  createCoupon: async (data) => {
    const res = await api.post('/coupons', data);
    return res.data;
  },
  deleteCoupon: async (id) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  }
};
