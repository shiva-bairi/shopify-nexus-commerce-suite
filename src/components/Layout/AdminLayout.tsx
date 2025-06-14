import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Home, Package, ShoppingCart, Users, BarChart3, LifeBuoy, Archive, Gift, Settings, CreditCard, Truck, MessageSquare, Megaphone, Brain, DollarSign, FileText, UserCog, Building, Scale } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if user is admin
  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
        if (error) {
          console.error('Admin check error:', error);
          return false;
        }
        return data;
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!user
  });

  if (loading || adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }

  // Redirect to admin login if no user or not admin
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/inventory', label: 'Inventory', icon: Archive },
    { path: '/admin/shipping', label: 'Shipping', icon: Truck },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/support', label: 'Support', icon: LifeBuoy },
    { path: '/admin/marketing', label: 'Marketing', icon: Megaphone },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/finance', label: 'Finance', icon: DollarSign },
    { path: '/admin/coupons', label: 'Coupons', icon: Gift },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">Admin Panel</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Welcome, Admin</Badge>
            <Button variant="outline" asChild>
              <Link to="/">Back to Store</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
