import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Sun, Moon, Heart, User, LogOut, LayoutDashboard, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount, setIsDrawerOpen } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center shadow-lg shadow-brand-500/30 text-white">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span>Quick<span className="text-brand-500">Bite</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <Link to="/restaurants" className="hover:text-brand-500 transition-colors">Restaurants</Link>
          {isAuthenticated && (
            <>
              <Link to="/orders" className="hover:text-brand-500 transition-colors">My Orders</Link>
              <Link to="/favorites" className="hover:text-brand-500 transition-colors flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" /> Favorites
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 font-semibold hover:bg-brand-500 hover:text-white transition-all">
              <LayoutDashboard className="w-4 h-4" /> Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Auth Button / Profile Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
              <Link to="/profile" className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-brand-500/30 object-cover"
                />
                <span className="hidden sm:inline-block font-medium text-sm max-w-[100px] truncate">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
