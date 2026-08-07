import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Edit2, Trash2 } from 'lucide-react';
import { menuApi } from '../../services/menuApi';
import { MenuModal } from '../../components/admin/MenuModal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchMenuItems = () => {
    setLoading(true);
    menuApi.getMenuItems()
      .then((data) => {
        setMenuItems(data.items || data || []);
      })
      .catch((err) => {
        showToast("Failed to fetch menu items", "error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await menuApi.deleteMenuItem(id);
      showToast("Food item deleted successfully", "success");
      fetchMenuItems();
    } catch (err) {
      showToast("Failed to delete food item", "error");
    }
  };

  if (loading && menuItems.length === 0) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Utensils className="w-8 h-8 text-brand-500" /> Manage Food Menu
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage individual dishes, pricing, description, and availability.</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Grid List */}
      {menuItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
          <p className="font-bold text-gray-500 dark:text-gray-400">No food items added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} 
                  alt={item.name} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                        item.is_veg 
                          ? 'border-emerald-200 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                          : 'border-rose-200 text-rose-500 bg-rose-50 dark:bg-rose-950/20'
                      }`}>
                        {item.is_veg ? 'VEG' : 'NON-VEG'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-brand-500">₹{item.final_price?.toFixed(2) || item.price?.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">₹{item.price?.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="px-5 py-4 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Edit Food Item"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="Delete Food Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItem={selectedItem}
        onSuccess={fetchMenuItems}
      />
    </div>
  );
};
