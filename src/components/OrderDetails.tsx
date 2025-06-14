
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

interface OrderTimeline {
  id: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface OrderWithItems {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_status: string;
  tracking_number: string | null;
  carrier: string | null;
  shipping_address: any;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      id: string;
      name: string;
      product_images: Array<{ image_url: string; is_primary: boolean }>;
    };
  }>;
}

const OrderDetails = ({ orderId, onBack }: OrderDetailsProps) => {
  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              id,
              name,
              product_images (image_url, is_primary)
            )
          )
        `)
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return data as OrderWithItems;
    }
  });

  // Fetch order timeline
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['order-timeline', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as OrderTimeline[];
    }
  });

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div>Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Order not found</p>
        <Button className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
      case 'pending':
        return <Package className="h-4 w-4" />;
      case 'processing':
      case 'payment_confirmed':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <Badge className={getStatusColor(order.status)}>
          {formatStatus(order.status)}
        </Badge>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order #{order.id.slice(0, 8)}</span>
            <span className="text-lg font-bold">${order.total_amount}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{format(new Date(order.created_at), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                {formatStatus(order.payment_status)}
              </Badge>
            </div>
            {order.tracking_number && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-medium font-mono">{order.tracking_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carrier</p>
                  <p className="font-medium">{order.carrier || 'Not specified'}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.shipping_address ? (
            <div className="space-y-1">
              <p className="font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p>{order.shipping_address.address_line_1}</p>
              {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
              <p>{order.shipping_address.country}</p>
            </div>
          ) : (
            <p className="text-gray-600">No shipping address available</p>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item) => {
              const image = item.products.product_images?.find(img => img.is_primary)?.image_url || 
                           item.products.product_images?.[0]?.image_url || '/placeholder.svg';
              
              return (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img src={image} alt={item.products.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.products.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ${item.price_at_purchase}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Tracking Timeline */}
      {(order.status === 'processing' || order.status === 'shipped' || timeline?.length) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <div>Loading tracking information...</div>
            ) : timeline && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((entry, index) => (
                  <div key={entry.id} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        {getTimelineIcon(entry.status)}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{formatStatus(entry.status)}</h4>
                        <span className="text-sm text-gray-500">
                          {format(new Date(entry.created_at), 'PPp')}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No tracking information available yet</p>
                <p className="text-sm">Tracking details will appear here once your order is processed</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetails;
