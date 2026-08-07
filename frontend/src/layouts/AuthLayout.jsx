import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-tr from-slate-900 via-slate-800 to-brand-950 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

        <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight z-10">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span>Quick<span className="text-brand-500">Bite</span></span>
        </Link>

        <div className="space-y-4 max-w-md z-10">
          <span className="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Premium Food Experience
          </span>
          <h1 className="text-4xl font-extrabold leading-tight">
            Order your favorite food in seconds.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Join thousands of food lovers enjoying instant ordering, real-time tracking, zero service fees, and mouth-watering discounts.
          </p>
        </div>

        <div className="text-xs text-slate-400 z-10">
          © 2026 QuickBite Food System. College viva & production deployment ready.
        </div>
      </div>

      {/* Right Form Outlet */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-md w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
