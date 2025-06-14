
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Award, MessageSquare, TrendingUp, Search, Plus, Filter } from 'lucide-react';
import CustomerSegments from './CustomerSegments';
import LoyaltyPrograms from './LoyaltyPrograms';
import CustomerInteractions from './CustomerInteractions';

interface CustomerMetrics {
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date: string | null;
  support_tickets: number;
  open_tickets: number;
  loyalty_points: number;
  loyalty_tier: string;
}

interface CustomerWithMetrics {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  metrics: CustomerMetrics;
}

const CustomerManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customer overview data
  const { data: customerOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['customer-overview'],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;

      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total_amount, created_at');

      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('user_id, status');

      return {
        totalCustomers: customers?.length || 0,
        newCustomers: customers?.filter(c => 
          new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0,
        activeCustomers: orders?.reduce((acc, order) => {
          const isRecent = new Date(order.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          if (isRecent && !acc.includes(order.user_id)) {
            acc.push(order.user_id);
          }
          return acc;
        }, [] as string[]).length || 0,
        openTickets: tickets?.filter(t => t.status === 'open').length || 0
      };
    }
  });

  // Fetch customers with metrics
  const { data: customersWithMetrics, isLoading: customersLoading } = useQuery({
    queryKey: ['customers-with-metrics', searchTerm],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('first_name', `%${searchTerm}%`);
      
      if (error) throw error;

      const customersWithData = await Promise.all(
        profiles.slice(0, 20).map(async (profile) => {
          const { data: metrics } = await supabase.rpc('get_customer_metrics', {
            customer_id: profile.id
          });
          return {
            ...profile,
            metrics: metrics as CustomerMetrics || {
              total_orders: 0,
              total_spent: 0,
              avg_order_value: 0,
              last_order_date: null,
              support_tickets: 0,
              open_tickets: 0,
              loyalty_points: 0,
              loyalty_tier: 'bronze'
            }
          };
        })
      );

      return customersWithData as CustomerWithMetrics[];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overviewLoading ? '...' : customerOverview?.totalCustomers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {overviewLoading ? '...' : customerOverview?.newCustomers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {overviewLoading ? '...' : customerOverview?.activeCustomers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {overviewLoading ? '...' : customerOverview?.openTickets}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Database</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-8">Loading customers...</div>
              ) : (
                <div className="space-y-4">
                  {customersWithMetrics?.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {customer.first_name?.[0] || customer.id[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {customer.first_name} {customer.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">ID: {customer.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${customer.metrics.total_spent || 0}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.metrics.total_orders || 0} orders
                          </p>
                        </div>
                        <Badge variant={customer.metrics.loyalty_tier === 'gold' ? 'default' : 'secondary'}>
                          {customer.metrics.loyalty_tier || 'bronze'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments">
          <CustomerSegments />
        </TabsContent>

        <TabsContent value="loyalty">
          <LoyaltyPrograms />
        </TabsContent>

        <TabsContent value="interactions">
          <CustomerInteractions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
