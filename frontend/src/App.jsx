import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { HomePage } from './pages/customer/HomePage';
import { RestaurantsPage } from './pages/customer/RestaurantsPage';
import { RestaurantDetailPage } from './pages/customer/RestaurantDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { FavoritesPage } from './pages/customer/FavoritesPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { AuthLayout as AuthPageLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage as AdminDashboardPage } from './pages/admin/DashboardPage';
import { OrdersPage as AdminOrdersPage } from './pages/admin/OrdersPage';
import { RestaurantsPage as AdminRestaurantsPage } from './pages/admin/RestaurantsPage';
import { CategoriesPage as AdminCategoriesPage } from './pages/admin/CategoriesPage';
import { MenuPage as AdminMenuPage } from './pages/admin/MenuPage';
import { CouponsPage as AdminCouponsPage } from './pages/admin/CouponsPage';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
          <Route path="orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="orders/:id/success" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        </Route>
        <Route element={<AuthPageLayout />}>
          <Route path="login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        </Route>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="restaurants" element={<AdminRestaurantsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
