import React from 'react';
import { Plus, Minus, Star, Clock, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const MenuItemCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const cartItem = cart.items.find(i => i.menu_item_id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      showToast("Please log in to add items to your cart", "info");
      return;
    }
    const ok = await addToCart(item.id, 1);
    if (ok) showToast(`Added ${item.name} to cart`, "success");
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, quantity - 1);
  };

  const finalPrice = item.final_price ?? (item.price * (1 - (item.discount || 0) / 100));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Left Details */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          {/* Veg / Non-Veg Badge */}
          <span className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm shrink-0 ${item.is_veg ? 'border-emerald-600' : 'border-rose-600'}`}>
            <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
          </span>

          {/* Popular Tag */}
          {item.is_popular && (
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20">
              <Flame className="w-3 h-3" /> Popular
            </span>
          )}
        </div>

        <h4 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
          {item.name}
        </h4>

        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base text-gray-900 dark:text-white">
              ₹{finalPrice.toFixed(2)}
            </span>
            {item.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{item.price.toFixed(2)}
              </span>
            )}
          </div>

          {item.discount > 0 && (
            <span className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              {item.discount}% OFF
            </span>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-400 border-l border-gray-200 dark:border-slate-700 pl-3">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>{item.preparation_time || "20 mins"}</span>
          </div>
        </div>
      </div>

      {/* Right Image & Add Button */}
      <div className="relative w-full sm:w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img
          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Add/Quantity Overlay */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          {quantity > 0 ? (
            <div className="flex items-center bg-brand-500 text-white rounded-xl shadow-lg font-bold text-sm px-2 py-1 gap-3">
              <button onClick={handleDecrement} className="p-1 hover:bg-brand-600 rounded-md transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span>{quantity}</span>
              <button onClick={handleIncrement} className="p-1 hover:bg-brand-600 rounded-md transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!item.is_available}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1 ${
                item.is_available
                  ? 'bg-white text-brand-500 hover:bg-brand-500 hover:text-white dark:bg-slate-900 dark:text-brand-400'
                  : 'bg-gray-200 text-gray-400 dark:bg-slate-700 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {item.is_available ? 'ADD' : 'OUT OF STOCK'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
