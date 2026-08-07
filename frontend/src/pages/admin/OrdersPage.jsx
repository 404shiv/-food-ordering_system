import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Calendar, User, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const { showToast } = useToast();

  const statuses = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

  const fetchOrders = () => {
    setLoading(true);
    // Admins get all orders from backend
    orderApi.getOrders()
      .then((data) => {
        setOrders(data.items || []);
      })
      .catch((err) => {
        showToast("Failed to fetch orders", "error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`, "success");
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update status", "error");
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  if (loading && orders.length === 0) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-brand-500" /> Manage Orders
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">View real-time confirmed orders and track or update delivery workflow.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="w-full sm:w-auto px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-gray-100 dark:border-slate-800">
        {['All', ...statuses].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              filterStatus === status 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
          <p className="font-bold text-gray-500 dark:text-gray-400">No orders found matching this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row justify-between gap-6"
            >
              {/* Order Info & Items */}
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white">Order #{order.id}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {order.created_at}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Items Ordered ({order.items?.length})</span>
                  <div className="space-y-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                        <span>{item.name} <strong className="text-brand-500">x{item.quantity}</strong></span>
                        <span className="font-semibold">₹{item.total_price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 sm:col-span-3 lg:col-span-1">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate" title={order.delivery_address}>{order.delivery_address}</span>
                  </div>
                </div>
              </div>

              {/* Total & Status Selector */}
              <div className="lg:w-72 flex flex-row lg:flex-col justify-between items-center lg:items-end border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 gap-4 shrink-0">
                <div className="text-left lg:text-right space-y-1">
                  <p className="text-xs text-gray-400 font-medium">Total Revenue</p>
                  <p className="text-2xl font-extrabold text-brand-500">₹{order.grand_total?.toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full inline-block">
                    {order.payment_method?.toUpperCase()} • {order.payment_status}
                  </p>
                </div>

                <div className="w-full sm:w-auto lg:w-full space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block lg:text-right">Update Delivery Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="w-full p-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
