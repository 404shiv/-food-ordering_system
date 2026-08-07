import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, MapPin, Search, Plus, MessageSquare } from 'lucide-react';
import { restaurantApi } from '../../services/restaurantApi';
import { menuApi } from '../../services/menuApi';
import { reviewApi } from '../../services/reviewApi';
import { MenuItemCard } from '../../components/customer/MenuItemCard';
import { ReviewCard } from '../../components/customer/ReviewCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vegOnly, setVegOnly] = useState(false);
  const [searchDish, setSearchDish] = useState('');
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5.0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true);
      const [rData, mData, revData] = await Promise.all([
        restaurantApi.getRestaurantById(id),
        menuApi.getMenuItems({ restaurant_id: id, limit: 100 }),
        reviewApi.getReviews(id)
      ]);
      setRestaurant(rData);
      setMenuItems(mData.items || []);
      setReviews(revData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurantDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!restaurant) return <div className="text-center py-20 font-bold">Restaurant not found</div>;

  const filteredMenuItems = menuItems.filter(item => {
    if (vegOnly && !item.is_veg) return false;
    if (searchDish && !item.name.toLowerCase().includes(searchDish.toLowerCase())) return false;
    return true;
  });

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Please log in to write a review", "info");
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewApi.createReview({
        restaurant_id: id,
        rating: newRating,
        comment: newComment
      });
      showToast("Review published successfully!", "success");
      setNewComment('');
      setIsReviewModalOpen(false);
      loadRestaurantDetails();
    } catch (err) {
      showToast("Failed to post review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 min-h-screen">
      {/* Restaurant Hero Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-brand-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
              ★ {restaurant.rating?.toFixed(1)} ({restaurant.review_count} reviews)
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {restaurant.delivery_time}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold">{restaurant.name}</h1>
          <p className="text-xs text-slate-300 max-w-2xl">{restaurant.description}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-brand-500" /> {restaurant.address}, {restaurant.city}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Menu Search & Veg Toggle Bar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDish}
              onChange={(e) => setSearchDish(e.target.value)}
              placeholder="Search dishes in this restaurant..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-200">
              <span className="w-4 h-4 border-2 border-emerald-600 rounded-sm flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </span>
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="hidden"
              />
              Veg Only
            </label>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Write Review
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu Items ({filteredMenuItems.length})</h2>
          {filteredMenuItems.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No menu items match your search/filter criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews & Ratings</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No reviews yet. Be the first to leave a review!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Leave a Review</h3>
            
            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="font-bold text-sm ml-2 text-gray-800 dark:text-white">{newRating}.0</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Your Review / Comment</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell us about the food quality, packaging, and taste..."
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
