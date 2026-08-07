import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, color = "brand", growth = "+12%" }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-500">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{growth}</span>
      </div>
    </div>
  );
};
