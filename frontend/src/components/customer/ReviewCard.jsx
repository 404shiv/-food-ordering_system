import React from 'react';
import { Star } from 'lucide-react';

export const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/80 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={review.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_name}`}
            alt={review.user_name}
            className="w-9 h-9 rounded-full object-cover border border-brand-500/20"
          />
          <div>
            <h5 className="font-bold text-sm text-gray-900 dark:text-white">{review.user_name}</h5>
            <span className="text-[11px] text-gray-400">{review.created_at}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>{review.rating?.toFixed(1)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-12">
        "{review.comment}"
      </p>
    </div>
  );
};
