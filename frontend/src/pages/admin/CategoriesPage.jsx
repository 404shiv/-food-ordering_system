import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryApi } from '../../services/categoryApi';
import { CategoryModal } from '../../components/admin/CategoryModal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = () => {
    setLoading(true);
    categoryApi.getCategories()
      .then((data) => {
        setCategories(data.items || data || []);
      })
      .catch((err) => {
        showToast("Failed to fetch categories", "error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryApi.deleteCategory(id);
      showToast("Category deleted successfully", "success");
      fetchCategories();
    } catch (err) {
      showToast("Failed to delete category", "error");
    }
  };

  if (loading && categories.length === 0) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-8 h-8 text-brand-500" /> Manage Categories
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Classify menu offerings into distinct categories.</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Grid List */}
      {categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
          <p className="font-bold text-gray-500 dark:text-gray-400">No categories created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 text-2xl flex items-center justify-center">
                  {cat.icon || '🍲'}
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{cat.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{cat.description || 'No description provided.'}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-50 dark:border-slate-800/60">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-xs font-bold"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition text-xs font-bold"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
};
