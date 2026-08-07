import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { menuApi } from '../../services/menuApi';
import { restaurantApi } from '../../services/restaurantApi';
import { categoryApi } from '../../services/categoryApi';
import { useToast } from '../../context/ToastContext';

export const MenuModal = ({ isOpen, onClose, menuItem = null, onSuccess }) => {
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    restaurant_id: '',
    category_id: '',
    name: '',
    description: '',
    price: 250,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    is_veg: true,
    is_available: true,
    is_popular: false,
    preparation_time: '20 mins'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const rRes = await restaurantApi.getRestaurants({ limit: 100 });
        const cRes = await categoryApi.getCategories();
        setRestaurants(rRes.items || []);
        setCategories(cRes || []);
        if (!formData.restaurant_id && rRes.items?.length > 0) {
          setFormData(prev => ({ ...prev, restaurant_id: rRes.items[0].id }));
        }
        if (!formData.category_id && cRes?.length > 0) {
          setFormData(prev => ({ ...prev, category_id: cRes[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) loadDropdowns();
  }, [isOpen]);

  useEffect(() => {
    if (menuItem) {
      setFormData({
        restaurant_id: menuItem.restaurant_id || '',
        category_id: menuItem.category_id || '',
        name: menuItem.name || '',
        description: menuItem.description || '',
        price: menuItem.price || 250,
        discount: menuItem.discount || 0,
        image: menuItem.image || '',
        is_veg: menuItem.is_veg ?? true,
        is_available: menuItem.is_available ?? true,
        is_popular: menuItem.is_popular ?? false,
        preparation_time: menuItem.preparation_time || '20 mins'
      });
    }
  }, [menuItem]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount)
      };

      if (menuItem?.id) {
        await menuApi.updateMenuItem(menuItem.id, payload);
        showToast("Food item updated", "success");
      } else {
        await menuApi.createMenuItem(payload);
        showToast("Food item created", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to save item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {menuItem ? 'Edit Food Item' : 'Add New Food Item'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Select Restaurant</label>
              <select
                required
                value={formData.restaurant_id}
                onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              >
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Category</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Dish Name</label>
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
              <label className="font-semibold text-gray-700 dark:text-gray-300">Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Discount (%)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
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

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.is_veg}
                onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              Pure Vegetarian
            </label>
            <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded"
              />
              Popular Item
            </label>
            <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 text-brand-500 rounded"
              />
              In Stock
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
              <Save className="w-4 h-4" /> {menuItem ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
