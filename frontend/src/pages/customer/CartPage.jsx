import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const CartPage = () => {
  const { cart, updateQuantity, removeItem, applyCoupon, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    const res = await applyCoupon(couponInput.trim());
    setApplying(false);
    showToast(res.message, res.success ? "success" : "error");
    if (res.success) setCouponInput('');
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-500">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm">Looks like you haven't added any delicious food items yet.</p>
        <Link
          to="/restaurants"
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Explore Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Selected Items ({cart.items.length})
            </span>
            <button
              onClick={clearCart}
              className="text-xs text-rose-500 hover:underline font-semibold"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.menu_item_id}
                className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">{item.name}</h4>
                    <span className="text-xs font-extrabold text-brand-500">₹{item.final_price?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                  <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-xs font-bold px-1">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:text-black dark:hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-black dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="font-extrabold text-base text-gray-900 dark:text-white">
                    ₹{item.total_price?.toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeItem(item.menu_item_id)}
                    className="text-gray-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Order Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order Summary</h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo Code (QUICK50)"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white uppercase outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={applying}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl hover:bg-brand-500 transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Pricing Details */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cart.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{cart.gst?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{cart.delivery_charge === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `₹${cart.delivery_charge?.toFixed(2)}`}</span>
              </div>
              {cart.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Discount</span>
                  <span>-₹{cart.discount_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-lg text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-slate-700">
                <span>Grand Total</span>
                <span className="text-brand-500">₹{cart.grand_total?.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
