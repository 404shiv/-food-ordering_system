import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store, FolderTree, Utensils, 
  ShoppingBag, Tag, Star, ArrowLeft 
} from 'lucide-react';

export const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Manage Restaurants', path: '/admin/restaurants', icon: Store },
    { label: 'Manage Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Manage Food Menu', path: '/admin/menu', icon: Utensils },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Manage Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Manage Reviews', path: '/admin/reviews', icon: Star },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 min-h-screen flex flex-col justify-between p-4 shrink-0 transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-3 py-2 flex items-center justify-between">
          <Link to="/" className="font-extrabold text-xl text-gray-900 dark:text-white">
            Quick<span className="text-brand-500">Bite</span> <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full font-bold">Admin</span>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to App Link */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-500 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer App
        </Link>
      </div>
    </aside>
  );
};
