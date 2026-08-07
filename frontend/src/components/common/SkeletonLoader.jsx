import React from 'react';

export const RestaurantSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm animate-shimmer">
      <div className="h-48 bg-gray-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2" />
        <div className="pt-2 flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const MenuItemSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex gap-4 animate-shimmer">
      <div className="w-28 h-28 bg-gray-200 dark:bg-slate-700 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-full" />
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3 pt-2" />
      </div>
    </div>
  );
};
