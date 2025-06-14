import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import DashboardMetrics from './DashboardMetrics';
import LowStockAlerts from './LowStockAlerts';
import RecentOrders from './RecentOrders';
import QuickActions from './QuickActions';
import SystemStatus from './SystemStatus';
import BulkOperations from './BulkOperations';
import ImportExport from './ImportExport';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const [usersResult, productsResult, ordersResult, revenueResult, lowStockResult, recentOrdersResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
          supabase.from('products').select('name, stock, low_stock_threshold').lte('stock', 10),
          supabase
            .from('orders')
            .select(`
              id, 
              total_amount, 
              status, 
              created_at,
              user_id
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        // Get user profiles for recent orders
        const orderUserIds = recentOrdersResult.data?.map(order => order.user_id) || [];
        const profilesResult = orderUserIds.length > 0 
          ? await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', orderUserIds)
          : { data: [] };

        // Combine orders with profile data
        const recentOrdersWithProfiles = recentOrdersResult.data?.map(order => {
          const profile = profilesResult.data?.find(p => p.id === order.user_id);
          return {
            ...order,
            profiles: profile || { first_name: 'Unknown', last_name: 'Customer' }
          };
        }) || [];

        const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        return {
          totalUsers: usersResult.count || 0,
          totalProducts: productsResult.count || 0,
          totalOrders: ordersResult.count || 0,
          totalRevenue: totalRevenue,
          lowStockProducts: lowStockResult.data || [],
          recentOrders: recentOrdersWithProfiles
        };
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <DashboardMetrics stats={stats} />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <QuickActions />
          <SystemStatus />
          <BulkOperations />
          <ImportExport />
        </div>
        <LowStockAlerts lowStockProducts={stats?.lowStockProducts} />
        <RecentOrders recentOrders={stats?.recentOrders} />
      </div>
    </div>
  );
};

export default AdminDashboard;
