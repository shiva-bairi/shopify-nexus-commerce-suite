import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, Eye, CreditCard, Clock, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderTimeline from './OrderTimeline';
import ReturnManagement from './ReturnManagement';
import InvoiceManagement from './InvoiceManagement';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  user_id: string;
  tracking_number: string | null;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
    };
  }>;
  payment_transactions: Array<{
    id: string;
    payment_method: string;
    amount: number;
    status: string;
    created_at: string;
    transaction_id: string | null;
  }>;
  order_status_history: Array<{
    id: string;
    status: string;
    notes: string | null;
    created_at: string;
  }>;
  order_timeline: Array<{
    id: string;
    status: string;
    description: string | null;
    created_at: string;
    created_by: string | null;
    metadata: any;
  }>;
  order_returns: Array<{
    id: string;
    return_number: string;
    reason: string;
    description: string | null;
    status: string;
    return_type: string;
    refund_amount: number | null;
    created_at: string;
  }>;
  invoices: Array<{
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    subtotal: number;
    tax_amount: number | null;
    discount_amount: number | null;
    total_amount: number;
    status: string;
    notes: string | null;
    created_at: string;
  }>;
}

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', searchQuery, statusFilter, paymentStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            price_at_purchase,
            products(name)
          ),
          payment_transactions(
            id,
            payment_method,
            amount,
            status,
            created_at,
            transaction_id
          ),
          order_status_history(
            id,
            status,
            notes,
            created_at
          ),
          order_timeline(
            id,
            status,
            description,
            created_at,
            created_by,
            metadata
          ),
          order_returns(
            id,
            return_number,
            reason,
            description,
            status,
            return_type,
            refund_amount,
            created_at
          ),
          invoices(
            id,
            invoice_number,
            invoice_date,
            due_date,
            subtotal,
            tax_amount,
            discount_amount,
            total_amount,
            status,
            notes,
            created_at
          )
        `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (paymentStatusFilter !== 'all') {
        query = query.eq('payment_status', paymentStatusFilter);
      }

      if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,tracking_number.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (orderError) throw orderError;

      // Add to status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes: notes || `Status changed to ${status}`,
          changed_by: (await supabase.auth.getUser()).data.user?.id
        });
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handlePaymentStatusChange = (orderId: string, paymentStatus: string) => {
    updatePaymentStatusMutation.mutate({ orderId, paymentStatus });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      processing: { variant: 'default' as const, label: 'Processing' },
      shipped: { variant: 'outline' as const, label: 'Shipped' },
      delivered: { variant: 'default' as const, label: 'Delivered' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      paid: { variant: 'default' as const, label: 'Paid' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      refunded: { variant: 'outline' as const, label: 'Refunded' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Order Management</CardTitle>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders or tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  #{order.id.slice(0, 8)}
                  {order.tracking_number && (
                    <div className="text-xs text-gray-500">
                      Track: {order.tracking_number}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {order.user_id.slice(0, 8)}...
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.order_items.map((item, index) => (
                      <div key={index}>
                        {item.quantity}x {item.products.name}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                  {order.payment_transactions.length > 0 && (
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <CreditCard className="h-3 w-3" />
                      <span>{order.payment_transactions[0].payment_method}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  {getPaymentStatusBadge(order.payment_status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl">
                        <DialogHeader>
                          <DialogTitle>Order Management - #{order.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="timeline" className="space-y-4">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="payment">Payment</TabsTrigger>
                            <TabsTrigger value="status">Status</TabsTrigger>
                            <TabsTrigger value="returns">Returns</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="timeline" className="space-y-4">
                            <OrderTimeline 
                              orderId={order.id} 
                              timeline={order.order_timeline || []} 
                            />
                          </TabsContent>
                          
                          <TabsContent value="payment" className="space-y-4">
                            <h4 className="font-medium">Payment History</h4>
                            <div className="space-y-2">
                              {order.payment_transactions.map((transaction) => (
                                <div key={transaction.id} className="p-3 border rounded">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{transaction.payment_method}</span>
                                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                                      {transaction.status}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Amount: ${transaction.amount.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(transaction.created_at).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="status" className="space-y-4">
                            <h4 className="font-medium">Status History</h4>
                            <div className="space-y-2">
                              {order.order_status_history.map((history) => (
                                <div key={history.id} className="p-3 border rounded">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{history.status}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(history.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {history.notes && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {history.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="returns" className="space-y-4">
                            <ReturnManagement 
                              orderId={order.id}
                              orderItems={order.order_items}
                              returns={order.order_returns || []}
                            />
                          </TabsContent>

                          <TabsContent value="invoices" className="space-y-4">
                            <InvoiceManagement 
                              orderId={order.id}
                              orderTotal={order.total_amount}
                              invoices={order.invoices || []}
                            />
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                    <Select
                      value={order.status}
                      onValueChange={(status) => handleStatusChange(order.id, status)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={order.payment_status}
                      onValueChange={(status) => handlePaymentStatusChange(order.id, status)}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminOrders;
