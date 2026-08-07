import api from './api';

export const cartApi = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },
  addItem: async (menuItemId, quantity = 1) => {
    const res = await api.post('/cart/items', { menu_item_id: menuItemId, quantity });
    return res.data;
  },
  updateQuantity: async (menuItemId, quantity) => {
    const res = await api.put(`/cart/items/${menuItemId}`, { menu_item_id: menuItemId, quantity });
    return res.data;
  },
  removeItem: async (menuItemId) => {
    const res = await api.delete(`/cart/items/${menuItemId}`);
    return res.data;
  },
  applyCoupon: async (couponCode) => {
    const res = await api.post('/cart/apply-coupon', { coupon_code: couponCode });
    return res.data;
  },
  clearCart: async () => {
    const res = await api.delete('/cart/clear');
    return res.data;
  }
};
