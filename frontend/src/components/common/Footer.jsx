import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span>Quick<span className="text-brand-500">Bite</span></span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Delivering happiness and gourmet meals right to your doorstep. Fresh, hot, and insanely fast.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/restaurants" className="hover:text-brand-500 transition-colors">Browse Restaurants</Link></li>
              <li><Link to="/orders" className="hover:text-brand-500 transition-colors">Track Order</Link></li>
              <li><Link to="/favorites" className="hover:text-brand-500 transition-colors">Saved Favorites</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Popular Cuisines</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>North Indian & Curries</li>
              <li>Italian & Wood-Fired Pizza</li>
              <li>Gourmet Burgers & Wings</li>
              <li>Authentic Dum Biryani</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Contact & Support</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">24/7 Viva Customer Support</p>
            <p className="text-sm font-semibold text-brand-500">+91 1800-QUICKBITE</p>
            <p className="text-xs text-gray-400 mt-2">support@quickbite.com</p>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>© 2026 QuickBite Food Ordering System. Built for viva & production demo.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> using React, FastAPI & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};
