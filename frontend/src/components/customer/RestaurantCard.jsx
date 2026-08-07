import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import { favoriteApi } from '../../services/favoriteApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RestaurantCard = ({ restaurant, isFav = false, onFavToggle }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [favorite, setFavorite] = useState(isFav);

  const handleToggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast("Please sign in to save favorites", "info");
      return;
    }
    try {
      const res = await favoriteApi.toggleFavorite("restaurant", restaurant.id);
      setFavorite(res.is_favorite);
      if (onFavToggle) onFavToggle(restaurant.id, res.is_favorite);
      showToast(res.message, "success");
    } catch (err) {
      showToast("Failed to update favorite", "error");
    }
  };

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Image Banner Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img
          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Favorite Heart Button */}
        <button
          onClick={handleToggleFav}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-gray-700 dark:text-gray-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shadow-md"
          title="Save to Favorites"
        >
          <Heart className={`w-5 h-5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-white" />
          <span>{restaurant.rating?.toFixed(1) || "4.5"}</span>
          <span className="text-[10px] text-emerald-100 font-normal">({restaurant.review_count || 0})</span>
        </div>

        {/* Delivery Time Pill */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{restaurant.delivery_time || "30-40 mins"}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {restaurant.description}
          </p>
        </div>

        {/* Cuisine Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {restaurant.cuisine?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-700/60 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Location & Delivery Fee */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>{restaurant.city || "City Center"}</span>
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            ₹{restaurant.delivery_fee || 40} Delivery
          </span>
        </div>
      </div>
    </Link>
  );
};
