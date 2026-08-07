import api from './api';

export const favoriteApi = {
  getFavorites: async () => {
    const res = await api.get('/favorites');
    return res.data;
  },
  toggleFavorite: async (itemType, targetId) => {
    const res = await api.post('/favorites/toggle', { item_type: itemType, target_id: targetId });
    return res.data;
  }
};
