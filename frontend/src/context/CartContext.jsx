import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    restaurant_id: null,
    subtotal: 0.0,
    gst: 0.0,
    delivery_charge: 0.0,
    coupon_code: null,
    discount_amount: 0.0,
    grand_total: 0.0
  });
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        restaurant_id: null,
        subtotal: 0.0,
        gst: 0.0,
        delivery_charge: 0.0,
        coupon_code: null,
        discount_amount: 0.0,
        grand_total: 0.0
      });
      return;
    }
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (menuItemId, quantity = 1) => {
    if (!isAuthenticated) return false;
    try {
      setLoading(true);
      const updatedCart = await cartApi.addItem(menuItemId, quantity);
      setCart(updatedCart);
      setIsDrawerOpen(true); // Auto pop drawer on add
      return true;
    } catch (err) {
      console.error("Add to cart failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (menuItemId, quantity) => {
    try {
      setLoading(true);
      const updatedCart = await cartApi.updateQuantity(menuItemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error("Update quantity failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      setLoading(true);
      const updatedCart = await cartApi.removeItem(menuItemId);
      setCart(updatedCart);
    } catch (err) {
      console.error("Remove item failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      const updatedCart = await cartApi.applyCoupon(couponCode);
      setCart(updatedCart);
      return { success: true, message: "Coupon applied successfully!" };
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to apply coupon";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      setCart({
        items: [],
        restaurant_id: null,
        subtotal: 0.0,
        gst: 0.0,
        delivery_charge: 0.0,
        coupon_code: null,
        discount_amount: 0.0,
        grand_total: 0.0
      });
    } catch (err) {
      console.error("Clear cart failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      isDrawerOpen,
      setIsDrawerOpen,
      totalItemCount,
      addToCart,
      updateQuantity,
      removeItem,
      applyCoupon,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
