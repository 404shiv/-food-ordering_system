import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ArrowRight, Download } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const OrdersPage = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders();
      setOrders(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await orderApi.cancelOrder(orderId);
      showToast("Order cancelled successfully", "success");
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not cancel order", "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-gray-500">You haven't placed any orders yet.</p>
          <Link to="/restaurants" className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md inline-block">
            Start Ordering
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isDelivered = ord.status === 'Delivered';
            const isCancelled = ord.status === 'Cancelled';

            return (
              <div
                key={ord.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-700/60">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{ord.restaurant_name}</h3>
                    <p className="text-xs text-gray-400">Order #{ord.id} • {ord.created_at}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isDelivered
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : isCancelled
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    ● {ord.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-bold">₹{item.total_price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/60 gap-4">
                  <div className="text-xs">
                    <span className="text-gray-400">Total Amount: </span>
                    <span className="font-extrabold text-base text-brand-500">₹{ord.grand_total?.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() => handleCancel(ord.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900"
                      >
                        Cancel Order
                      </button>
                    )}

                    <Link
                      to={`/orders/${ord.id}`}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl hover:bg-brand-500 transition-colors flex items-center gap-1"
                    >
                      Track Order <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
