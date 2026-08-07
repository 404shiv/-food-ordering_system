import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { couponApi } from '../../services/couponApi';
import { CouponModal } from '../../components/admin/CouponModal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchCoupons = () => {
    setLoading(true);
    couponApi.getCoupons()
      .then((data) => {
        setCoupons(data || []);
      })
      .catch((err) => {
        showToast("Failed to fetch coupons", "error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponApi.deleteCoupon(id);
      showToast("Coupon deleted successfully", "success");
      fetchCoupons();
    } catch (err) {
      showToast("Failed to delete coupon", "error");
    }
  };

  if (loading && coupons.length === 0) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tag className="w-8 h-8 text-brand-500" /> Manage Coupons
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Configure promotional discount codes.</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Grid List */}
      {coupons.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
          <p className="font-bold text-gray-500 dark:text-gray-400">No active coupons configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-black text-lg text-brand-500 tracking-wider font-mono bg-brand-500/10 px-3 py-1 rounded-xl">{coupon.code}</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                </h3>
                <p className="text-xs text-gray-400">Min Order: ₹{coupon.min_order_value?.toFixed(2)} • Max Discount: ₹{coupon.max_discount_value?.toFixed(2) || 'N/A'}</p>
                <p className="text-xs text-gray-400">Expires: {coupon.expire_date}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-50 dark:border-slate-800/60">
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition text-xs font-bold"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCoupons}
      />
    </div>
  );
};
