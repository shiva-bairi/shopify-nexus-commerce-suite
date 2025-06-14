
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import AdminUsers from '@/components/Admin/AdminUsers';
import AdminProducts from '@/components/Admin/AdminProducts';
import AdminOrders from '@/components/Admin/AdminOrders';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import AdminSupport from '@/components/Admin/AdminSupport';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import CustomerManagement from '@/components/Admin/CustomerManagement';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminError } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      console.log('Checking admin status for user:', user.id);
      
      try {
        const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
        if (error) {
          console.error('Admin check error:', error);
          throw error;
        }
        console.log('Admin check result:', data);
        return data;
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!user
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    console.log('Auth state:', { user: !!user, loading });
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    console.log('Admin check state:', { isAdmin, adminCheckLoading, user: !!user });
  }, [isAdmin, adminCheckLoading, user]);

  if (loading || adminCheckLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600">Please log in to access the admin panel.</p>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Check Failed</h1>
        <p className="text-gray-600">Error checking admin status: {adminError.message}</p>
        <p className="text-sm text-gray-500 mt-2">
          This might mean the admin_users table or is_admin function is not set up correctly.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
        <p className="text-sm text-gray-500">
          Your user ID: {user.id}<br />
          To grant admin access, an existing admin needs to add your user to the admin_users table.
        </p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'users':
        return <AdminUsers />;
      case 'customers':
        return <CustomerManagement />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'support':
        return <AdminSupport />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Welcome, Admin</Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {renderContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default Admin;
