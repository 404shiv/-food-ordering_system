import React from 'react';

export const CategoryFilterBar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition-all shadow-sm ${
          selectedCategory === null
            ? 'bg-brand-500 text-white shadow-brand-500/30'
            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'
        }`}
      >
        🍽️ All Categories
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs shrink-0 flex items-center gap-2 transition-all shadow-sm ${
              isSelected
                ? 'bg-brand-500 text-white shadow-brand-500/30 font-bold'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'
            }`}
          >
            <span>{cat.icon || '🍛'}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
