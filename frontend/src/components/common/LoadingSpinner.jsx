import React from 'react';
import { Utensils } from 'lucide-react';

export const LoadingSpinner = ({ label = "Loading delicious items..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-brand-200 dark:border-slate-700 border-t-brand-500 animate-spin" />
        <Utensils className="w-6 h-6 text-brand-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      {label && <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{label}</p>}
    </div>
  );
};
