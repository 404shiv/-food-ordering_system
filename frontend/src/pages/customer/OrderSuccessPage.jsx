import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, Download, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!order && id) {
      orderApi.getOrderById(id)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!order) return <div className="text-center py-20 font-bold">Order not found</div>;

  const handleDownloadInvoice = async () => {
    try {
      const blob = await orderApi.getInvoiceBlob(order.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QuickBite_Invoice_${order.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Invoice download error:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 min-h-screen text-center">
      {/* Celebration Header */}
      <div className="space-y-3 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center shadow-xl">
          <CheckCircle2 className="w-12 h-12 animate-bounce" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order Placed Successfully!</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Order ID: #{order.id}</p>
      </div>

      {/* Order Status Timeline Stepper */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" /> Estimated Delivery in 30-40 Mins
        </h3>

        <div className="flex items-center justify-between text-xs font-semibold relative pt-4">
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">1</div>
            <span className="text-brand-500 font-bold">Placed</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">2</div>
            <span className="text-amber-500 font-bold">Preparing</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 flex items-center justify-center font-bold">3</div>
            <span className="text-gray-400">On the way</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 flex items-center justify-center font-bold">4</div>
            <span className="text-gray-400">Delivered</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: PDF Invoice & QR Code */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleDownloadInvoice}
          className="px-5 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-brand-500 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download PDF Invoice
        </button>

        <button
          onClick={() => setShowQR(!showQR)}
          className="px-5 py-3 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <QrCode className="w-4 h-4 text-brand-500" /> {showQR ? 'Hide Order QR' : 'Show Verification QR'}
        </button>
      </div>

      {/* QR Code Container */}
      {showQR && order.qr_code_svg && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border max-w-xs mx-auto space-y-3 animate-fade-in shadow-xl">
          <img src={order.qr_code_svg} alt="Order Verification QR" className="w-40 h-40 mx-auto" />
          <p className="text-[11px] text-gray-500">Scan QR Code upon order delivery for instant receipt verification.</p>
        </div>
      )}

      <div className="pt-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 font-bold text-sm text-brand-500 hover:underline"
        >
          View Order History <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
