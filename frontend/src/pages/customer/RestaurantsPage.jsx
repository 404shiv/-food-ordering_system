import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Star } from 'lucide-react';
import { restaurantApi } from '../../services/restaurantApi';
import { categoryApi } from '../../services/categoryApi';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { RestaurantSkeleton } from '../../components/common/SkeletonLoader';

export const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'rating');
  const [page, setPage] = useState(1);

  const [restaurants, setRestaurants] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        sort_by: sortBy,
      };
      if (search) params.search = search;
      if (cuisine) params.cuisine = cuisine;
      if (minRating) params.rating = parseFloat(minRating);

      const res = await restaurantApi.getRestaurants(params);
      setRestaurants(res.items || []);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [search, cuisine, minRating, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Header & Search */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Discover Restaurants</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Order from top dining destinations near you</p>

        {/* Filter Bar Controls */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by restaurant name or city..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Filter Dropdown */}
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 outline-none"
            >
              <option value="">All Ratings</option>
              <option value="4.5">★ 4.5+ Top Rated</option>
              <option value="4.0">★ 4.0+ Great</option>
            </select>

            {/* Sort By Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 outline-none"
            >
              <option value="rating">Sort by Rating</option>
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <RestaurantSkeleton key={i} />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-base font-bold text-gray-700 dark:text-gray-300">No restaurants match your filter parameters</p>
          <button
            onClick={() => { setSearch(''); setCuisine(''); setMinRating(''); setSortBy('rating'); }}
            className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
