import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Users, Store, IndianRupee, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/analyticsApi';
import { StatsCard } from '../../components/admin/StatsCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (!stats) return <div className="text-center py-20 font-bold text-gray-500">Failed to load dashboard metrics.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8 text-brand-500" /> Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Real-time overview of orders, revenue, and store operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`₹${stats.total_revenue?.toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          growth="+18.4%"
        />
        <StatsCard 
          title="Total Orders" 
          value={stats.total_orders} 
          icon={ShoppingBag} 
          growth="+10.2%"
        />
        <StatsCard 
          title="Active Customers" 
          value={stats.total_customers} 
          icon={Users} 
          growth="+8.5%"
        />
        <StatsCard 
          title="Registered Restaurants" 
          value={stats.total_restaurants} 
          icon={Store} 
          growth="+2.1%"
        />
      </div>

      {/* Analytics Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1">
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-semibold">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Restaurant</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {stats.recent_orders?.map((order) => (
                  <tr key={order.id} className="text-gray-700 dark:text-gray-300">
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">#{order.id.slice(-6)}</td>
                    <td className="py-3.5">{order.customer_name}</td>
                    <td className="py-3.5">{order.restaurant_name}</td>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">₹{order.grand_total?.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling & Monthly Sales */}
        <div className="space-y-6">
          {/* Top Selling Items */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-brand-500" /> Popular Dishes
            </h3>
            
            <div className="space-y-3.5">
              {stats.top_selling_items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 font-bold flex items-center justify-center">{idx + 1}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  </div>
                  <span className="font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full text-[10px]">{item.count} sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Sales Breakdown list */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Monthly Sales</h3>
            <div className="space-y-3">
              {stats.monthly_sales?.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">{entry.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{entry.orders} orders</span>
                    <span className="font-bold text-gray-900 dark:text-white">₹{entry.sales?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
