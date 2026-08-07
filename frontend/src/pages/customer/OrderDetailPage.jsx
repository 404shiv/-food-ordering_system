import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, Download, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    orderApi.getOrderById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
      console.error(err);
    }
  };

  const statusSteps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentIndex = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order Status & Live Tracking</h1>
          <p className="text-xs text-gray-400">Order ID: #{order.id} • Placed on {order.created_at}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-500 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> PDF Invoice
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="px-4 py-2 border border-gray-200 dark:border-slate-700 font-bold text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-brand-500" /> QR Code
          </button>
        </div>
      </div>

      {/* Status Stepper Timeline */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" /> Current Status: <span className="text-brand-500">{order.status}</span>
        </h3>

        <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
          {statusSteps.map((st, idx) => {
            const isCompleted = idx <= currentIndex;
            return (
              <div key={st} className="space-y-2">
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-colors ${
                  isCompleted ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                <span className={isCompleted ? 'text-brand-500 font-bold' : 'text-gray-400'}>{st}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Popup */}
      {showQR && order.qr_code_svg && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 max-w-xs mx-auto text-center space-y-3 shadow-xl">
          <img src={order.qr_code_svg} alt="Order Verification QR" className="w-40 h-40 mx-auto" />
          <p className="text-xs text-gray-500">Scan QR Code upon order delivery for receipt verification.</p>
        </div>
      )}

      {/* Details breakdown */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white">Order Items from {order.restaurant_name}</h3>

        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>{item.name} x {item.quantity}</span>
              <span className="font-bold">₹{item.total_price?.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>₹{order.gst?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span>₹{order.delivery_charge?.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-500 font-bold">
              <span>Discount</span>
              <span>-₹{order.discount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-white pt-2 border-t">
            <span>Grand Total Paid ({order.payment_method.toUpperCase()})</span>
            <span className="text-brand-500">₹{order.grand_total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
