import api from './api';

export const reviewApi = {
  getReviews: async (restaurantId) => {
    const res = await api.get('/reviews', { params: { restaurant_id: restaurantId } });
    return res.data;
  },
  createReview: async (data) => {
    const res = await api.post('/reviews', data);
    return res.data;
  },
  deleteReview: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  }
};
