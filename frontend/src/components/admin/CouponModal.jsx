import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { couponApi } from '../../services/couponApi';
import { useToast } from '../../context/ToastContext';

export const CouponModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    code: 'SAVE50',
    discount_percentage: 50.0,
    max_discount_amount: 100.0,
    min_order_amount: 199.0,
    is_active: true,
    valid_until: '2026-12-31'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await couponApi.createCoupon({
        ...formData,
        discount_percentage: parseFloat(formData.discount_percentage),
        max_discount_amount: parseFloat(formData.max_discount_amount),
        min_order_amount: parseFloat(formData.min_order_amount)
      });
      showToast("Coupon created successfully", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to create coupon", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Coupon</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Coupon Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white uppercase font-bold outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Discount (%)</label>
              <input
                type="number"
                required
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Max Discount (₹)</label>
              <input
                type="number"
                required
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Min Order Amount (₹)</label>
            <input
              type="number"
              required
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
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
              <Save className="w-4 h-4" /> Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
