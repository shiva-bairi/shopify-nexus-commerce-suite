
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Deals from "./pages/Deals";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import Contact from "./pages/Contact";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import Support from "./pages/Support";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Import all admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProducts";
import AdminOrdersPage from "./pages/admin/AdminOrders";
import AdminUsersPage from "./pages/admin/AdminUsers";
import AdminCustomersPage from "./pages/admin/AdminCustomers";
import AdminInventoryPage from "./pages/admin/AdminInventory";
import AdminCouponsPage from "./pages/admin/AdminCoupons";
import AdminShippingPage from "./pages/admin/AdminShipping";
import AdminMarketingPage from "./pages/admin/AdminMarketing";
import AdminFinancePage from "./pages/admin/AdminFinance";
import AdminSettingsPage from "./pages/admin/AdminSettings";
import AdminAnalyticsPage from "./pages/admin/AdminAnalytics";
import AdminSupportPage from "./pages/admin/AdminSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin auth routes (without any layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          
          {/* NEW: Public auth route */}
          <Route path="/auth" element={<Auth />} />

          {/* Admin routes with AdminLayout */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="support" element={<AdminSupportPage />} />
                  <Route path="shipping" element={<AdminShippingPage />} />
                  <Route path="marketing" element={<AdminMarketingPage />} />
                  <Route path="finance" element={<AdminFinancePage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  {/* Redirect /admin to /admin/dashboard */}
                  <Route path="" element={<AdminDashboardPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Public routes with main Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Public auth routes */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Signup />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected routes */}
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment-success" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Public routes */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/deals" element={<Deals />} />
                
                {/* Support and Information pages */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<Support />} />
                <Route path="/shipping" element={<ShippingInfo />} />
                <Route path="/returns" element={<Returns />} />
                
                {/* Policy pages */}
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
