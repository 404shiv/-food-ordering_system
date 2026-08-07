import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Trash2, Star, Clock } from 'lucide-react';
import { restaurantApi } from '../../services/restaurantApi';
import { RestaurantModal } from '../../components/admin/RestaurantModal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRest, setSelectedRest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchRestaurants = () => {
    setLoading(true);
    restaurantApi.getRestaurants()
      .then((data) => {
        // backend might return { items: [...] } or list
        setRestaurants(data.items || data || []);
      })
      .catch((err) => {
        showToast("Failed to fetch restaurants", "error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleEdit = (rest) => {
    setSelectedRest(rest);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRest(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    try {
      await restaurantApi.deleteRestaurant(id);
      showToast("Restaurant deleted successfully", "success");
      fetchRestaurants();
    } catch (err) {
      showToast("Failed to delete restaurant", "error");
    }
  };

  if (loading && restaurants.length === 0) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Store className="w-8 h-8 text-brand-500" /> Manage Restaurants
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add, edit, or delete registered food delivery outlets.</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {/* Grid List */}
      {restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
          <p className="font-bold text-gray-500 dark:text-gray-400">No restaurants registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <div key={rest.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <img 
                  src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} 
                  alt={rest.name} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{rest.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg text-amber-500 font-extrabold text-[10px] shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" /> {rest.rating || 'N/A'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{rest.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {rest.cuisine?.map((c, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-semibold">{c}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {rest.delivery_time || '30 mins'}</span>
                    <span>Fee: ₹{rest.delivery_fee?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="px-5 py-4 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => handleEdit(rest)}
                  className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Edit Restaurant"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(rest.id)}
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="Delete Restaurant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <RestaurantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurant={selectedRest}
        onSuccess={fetchRestaurants}
      />
    </div>
  );
};
