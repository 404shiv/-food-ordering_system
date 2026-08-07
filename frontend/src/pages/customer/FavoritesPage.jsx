import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { favoriteApi } from '../../services/favoriteApi';
import { RestaurantCard } from '../../components/customer/RestaurantCard';
import { MenuItemCard } from '../../components/customer/MenuItemCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavs = async () => {
    try {
      setLoading(true);
      const res = await favoriteApi.getFavorites();
      setFavorites(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavs();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  const restaurantFavs = favorites.filter(f => f.item_type === 'restaurant' && f.details);
  const dishFavs = favorites.filter(f => f.item_type === 'menu_item' && f.details);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
          <Heart className="w-6 h-6 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Saved Favorites</h1>
          <p className="text-xs text-gray-500">Your favorite restaurants and bookmarked meals</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-500">No saved favorites yet.</p>
        </div>
      ) : (
        <>
          {restaurantFavs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Favorite Restaurants ({restaurantFavs.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantFavs.map(f => (
                  <RestaurantCard
                    key={f.id}
                    restaurant={f.details}
                    isFav={true}
                    onFavToggle={() => fetchFavs()}
                  />
                ))}
              </div>
            </div>
          )}

          {dishFavs.length > 0 && (
            <div className="space-y-4 pt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Favorite Dishes ({dishFavs.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dishFavs.map(f => (
                  <MenuItemCard key={f.id} item={f.details} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
