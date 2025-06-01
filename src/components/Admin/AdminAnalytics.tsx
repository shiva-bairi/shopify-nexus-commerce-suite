
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, ShoppingCart, DollarSign, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SiteAnalytics {
  date: string;
  unique_visitors: number;
  page_views: number;
  sessions: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversion_rate: number;
  revenue: number;
}

interface ProductAnalytics {
  product_id: string;
  products: { name: string };
  views_count: number;
  cart_additions: number;
  purchases: number;
  date: string;
}

const AdminAnalytics = () => {
  const [dateRange] = useState('7'); // Default to last 7 days

  const { data: siteAnalytics, isLoading: siteLoading } = useQuery({
    queryKey: ['site-analytics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_analytics')
        .select('*')
        .gte('date', new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as SiteAnalytics[];
    }
  });

  const { data: productAnalytics, isLoading: productLoading } = useQuery({
    queryKey: ['product-analytics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_analytics')
        .select(`
          *,
          products(name)
        `)
        .gte('date', new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('views_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as ProductAnalytics[];
    }
  });

  const { data: totalOrders } = useQuery({
    queryKey: ['total-orders'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: totalRevenue } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');
      
      if (error) throw error;
      return data.reduce((sum, order) => sum + Number(order.total_amount), 0);
    }
  });

  const { data: totalCustomers } = useQuery({
    queryKey: ['total-customers'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: totalProducts } = useQuery({
    queryKey: ['total-products'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  if (siteLoading || productLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const latestSiteData = siteAnalytics?.[siteAnalytics.length - 1];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue?.toLocaleString() || '0'}</div>
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
            <div className="text-2xl font-bold">{totalOrders?.toLocaleString() || '0'}</div>
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
            <div className="text-2xl font-bold">{totalCustomers?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              In catalog
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Site Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={siteAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Website Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={siteAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="unique_visitors" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Unique Visitors"
                />
                <Line 
                  type="monotone" 
                  dataKey="page_views" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Page Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="products.name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views_count" fill="#8884d8" name="Views" />
              <Bar dataKey="cart_additions" fill="#82ca9d" name="Cart Additions" />
              <Bar dataKey="purchases" fill="#ffc658" name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {latestSiteData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {(latestSiteData.conversion_rate * 100).toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Visitors who made a purchase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bounce Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {(latestSiteData.bounce_rate * 100).toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Single page sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {Math.floor(latestSiteData.avg_session_duration / 60)}m {latestSiteData.avg_session_duration % 60}s
              </div>
              <p className="text-sm text-muted-foreground">
                Time spent on site
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
