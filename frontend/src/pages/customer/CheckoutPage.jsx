import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../services/orderApi';
import { DemoPaymentModal } from '../../components/common/DemoPaymentModal';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (cart.items.length === 0) return <Navigate to="/cart" replace />;

  const handleStartPayment = (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      showToast("Please provide delivery address and phone number", "error");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentMethod) => {
    setIsPaymentModalOpen(false);
    setSubmitting(true);
    try {
      const orderPayload = {
        delivery_address: address,
        phone: phone,
        payment_method: paymentMethod,
        coupon_code: cart.coupon_code,
        order_notes: notes
      };
      const createdOrder = await orderApi.placeOrder(orderPayload);
      showToast("Order placed successfully!", "success");
      navigate(`/orders/${createdOrder.id}/success`, { state: { order: createdOrder } });
    } catch (err) {
      showToast(err.response?.data?.detail || "Order placement failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Delivery Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleStartPayment} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-500" /> Delivery Address & Details
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Delivery Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No., Street Name, Landmark, City, Pincode"
                className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Order Cooking Instructions / Notes (Optional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please make it less spicy, leave package at door."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Demo Payment Gateway <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Mini Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Order Summary ({cart.items.length} items)</h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.items.map(item => (
                <div key={item.menu_item_id} className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span className="truncate max-w-[180px]">{item.name} x {item.quantity}</span>
                  <span className="font-bold">₹{item.total_price?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
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
                <span>{cart.delivery_charge === 0 ? "FREE" : `₹${cart.delivery_charge?.toFixed(2)}`}</span>
              </div>
              {cart.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>Discount</span>
                  <span>-₹{cart.discount_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-white pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-brand-500">₹{cart.grand_total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaySuccess={handlePaymentSuccess}
        grandTotal={cart.grand_total}
      />
    </div>
  );
};
