import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const CartDrawer = () => {
  const { cart, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem, applyCoupon, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    const res = await applyCoupon(couponInput.trim());
    setApplying(false);
    showToast(res.message, res.success ? "success" : "error");
    if (res.success) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-gray-100 dark:border-slate-800">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <span>Your Cart</span>
              <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full">
                {cart.items.length} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Drawer Body Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-500">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-800 dark:text-white">Your cart is empty</h4>
                  <p className="text-xs text-gray-400 mt-1">Explore top restaurants and add delicious meals!</p>
                </div>
                <button
                  onClick={() => { setIsDrawerOpen(false); navigate('/restaurants'); }}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 flex gap-3 items-center"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</h5>
                    <span className="text-xs font-semibold text-brand-500">₹{item.final_price?.toFixed(2)}</span>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold">
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.menu_item_id)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                    ₹{item.total_price?.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Price Summary */}
          {cart.items.length > 0 && (
            <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon (QUICK50)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white uppercase outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-semibold text-xs rounded-xl hover:bg-brand-500 transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
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
                    <span>Discount ({cart.coupon_code})</span>
                    <span>-₹{cart.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-brand-500">₹{cart.grand_total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
