
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface DashboardMetricsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
  } | undefined;
}

const DashboardMetrics = ({ stats }: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            From paid orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalOrders?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            All time orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            Registered users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalProducts?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            In catalog
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
