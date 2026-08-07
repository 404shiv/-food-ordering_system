import api from './api';

export const restaurantApi = {
  getRestaurants: async (params = {}) => {
    const res = await api.get('/restaurants', { params });
    return res.data;
  },
  getRestaurantById: async (id) => {
    const res = await api.get(`/restaurants/${id}`);
    return res.data;
  },
  createRestaurant: async (data) => {
    const res = await api.post('/restaurants', data);
    return res.data;
  },
  updateRestaurant: async (id, data) => {
    const res = await api.put(`/restaurants/${id}`, data);
    return res.data;
  },
  deleteRestaurant: async (id) => {
    const res = await api.delete(`/restaurants/${id}`);
    return res.data;
  }
};
