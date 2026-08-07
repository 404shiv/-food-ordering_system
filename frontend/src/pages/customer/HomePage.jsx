import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Utensils, Flame, Sparkles, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { restaurantApi } from '../../services/restaurantApi';
import { menuApi } from '../../services/menuApi';
import { categoryApi } from '../../services/categoryApi';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { MenuItemCard } from '../../components/customer/MenuItemCard';
import { CategoryFilterBar } from '../../components/customer/CategoryFilterBar';
import { RestaurantSkeleton } from '../../components/common/SkeletonLoader';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catData, restData, menuData] = await Promise.all([
          categoryApi.getCategories(),
          restaurantApi.getRestaurants({ limit: 6, sort_by: 'rating' }),
          menuApi.getMenuItems({ limit: 4, is_popular: true })
        ]);
        setCategories(catData || []);
        setRestaurants(restData.items || []);
        setPopularDishes(menuData.items || []);
      } catch (err) {
        console.error("Home page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[40px] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-1.5 rounded-full text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" /> QuickBite Express Delivery
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Hungry? Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-400">Delicious Meals</span> Delivered Fast.
            </h1>

            <p className="text-slate-300 text-base max-w-lg mx-auto lg:mx-0">
              Discover top-rated local restaurants, gourmet burgers, wood-fired pizzas & authentic dum biryanis right to your door.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto lg:mx-0 flex items-center bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, dish, or restaurant..."
                className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-transparent outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
              >
                Search
              </button>
            </form>

            {/* Micro Features */}
            <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-6 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" /> 30 Mins Fast Delivery
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Hygienic Food
              </div>
            </div>
          </div>

          {/* Hero Banner Visual Image */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto w-full max-w-md h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
                alt="Delicious Gourmet Food"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Category Filter Bar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Explore Categories</h2>
            <Link to="/restaurants" className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              if (catId) navigate(`/restaurants?category_id=${catId}`);
            }}
          />
        </section>

        {/* Popular Dishes Carousel/Grid */}
        {popularDishes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Trending Foods</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularDishes.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Restaurants */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Rated Restaurants</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Handpicked fine dining and local street favorites</p>
            </div>
            <Link to="/restaurants" className="px-4 py-2 bg-brand-500/10 text-brand-500 font-bold text-xs rounded-xl hover:bg-brand-500 hover:text-white transition-all">
              See All Restaurants
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <RestaurantSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>

        {/* Promo Coupon Offer Banner */}
        <section className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Special Promo Offer
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Get 50% OFF on your first order!</h3>
            <p className="text-brand-100 text-xs">Use promo code <span className="font-extrabold bg-white text-brand-600 px-2 py-0.5 rounded-md">QUICK50</span> at checkout.</p>
          </div>
          <Link
            to="/restaurants"
            className="px-6 py-3 bg-slate-900 text-white hover:bg-black font-bold text-sm rounded-2xl shadow-lg transition-all shrink-0 transform hover:scale-105"
          >
            Order Now
          </Link>
        </section>
      </div>
    </div>
  );
};
