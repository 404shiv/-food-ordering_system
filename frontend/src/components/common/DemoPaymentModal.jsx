import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

export const DemoPaymentModal = ({ isOpen, onClose, onPaySuccess, grandTotal }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleProcessPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onPaySuccess(selectedMethod);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-6 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">QuickBite Demo Gateway</h3>
              <p className="text-xs text-gray-500">128-bit Encrypted Simulated Payment</p>
            </div>
          </div>
          <button onClick={onClose} disabled={processing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 p-5 rounded-2xl text-white flex justify-between items-center shadow-inner">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Amount to Pay</span>
            <div className="text-3xl font-extrabold text-brand-400">₹{grandTotal?.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" /> Demo Mode
          </div>
        </div>

        {/* Payment Success View */}
        {success ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3 animate-fade-in text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
            <h4 className="font-bold text-xl text-gray-900 dark:text-white">Payment Authorized!</h4>
            <p className="text-sm text-gray-500">Transaction ID: TXN_{Math.floor(10000000 + Math.random() * 90000000)}</p>
          </div>
        ) : (
          <>
            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'upi'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-500 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5" /> Instant UPI
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-500 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5" /> Card
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('cod')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-500 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5" /> Pay on Delivery
              </button>
            </div>

            {/* Method Form Input Details */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl space-y-3 border border-gray-100 dark:border-slate-800">
              {selectedMethod === 'upi' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="username@upi"
                  />
                  <p className="text-[11px] text-gray-400">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="08/28"
                      className="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      defaultValue="789"
                      maxLength={4}
                      className="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'cod' && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pay cash or UPI directly to the delivery rider when your order arrives.
                </p>
              )}
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={processing}
              onClick={handleProcessPayment}
              className="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Complete Demo Payment (₹${grandTotal?.toFixed(2)})`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
