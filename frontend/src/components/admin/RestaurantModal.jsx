import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { restaurantApi } from '../../services/restaurantApi';
import { useToast } from '../../context/ToastContext';

export const RestaurantModal = ({ isOpen, onClose, restaurant = null, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: 'North Indian, Biryani',
    address: '',
    city: 'New Delhi',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    delivery_time: '25-35 mins',
    delivery_fee: 40.0,
    opening_hours: '11:00 AM - 11:00 PM',
    is_available: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine || '',
        address: restaurant.address || '',
        city: restaurant.city || 'New Delhi',
        image: restaurant.image || '',
        delivery_time: restaurant.delivery_time || '25-35 mins',
        delivery_fee: restaurant.delivery_fee || 40.0,
        opening_hours: restaurant.opening_hours || '11:00 AM - 11:00 PM',
        is_available: restaurant.is_available ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        cuisine: 'North Indian, Biryani',
        address: '',
        city: 'New Delhi',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        delivery_time: '25-35 mins',
        delivery_fee: 40.0,
        opening_hours: '11:00 AM - 11:00 PM',
        is_available: true
      });
    }
  }, [restaurant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        cuisine: formData.cuisine.split(',').map(c => c.trim()).filter(Boolean),
        delivery_fee: parseFloat(formData.delivery_fee)
      };

      if (restaurant?.id) {
        await restaurantApi.updateRestaurant(restaurant.id, payload);
        showToast("Restaurant updated successfully", "success");
      } else {
        await restaurantApi.createRestaurant(payload);
        showToast("Restaurant created successfully", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || "Action failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Restaurant Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Cuisines (comma separated)</label>
              <input
                type="text"
                required
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Full Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Image URL</label>
            <input
              type="text"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Delivery Time</label>
              <input
                type="text"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.delivery_fee}
                onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
            />
            <label htmlFor="is_available" className="font-semibold text-gray-700 dark:text-gray-300">
              Restaurant Currently Open & Available
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> {restaurant ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
