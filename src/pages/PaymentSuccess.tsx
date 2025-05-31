
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Package, Clock } from 'lucide-react';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            price_at_purchase,
            products(name, product_images)
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Order</h1>
        <p className="text-gray-600 mb-4">No order ID found in the URL.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Thank you for your order. Your payment has been processed successfully.</p>
      </div>

      {order && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order ID:</span>
                <p className="text-gray-600">#{order.id.slice(0, 8)}</p>
              </div>
              <div>
                <span className="font-medium">Total Amount:</span>
                <p className="text-gray-600">${order.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="font-medium">Payment Method:</span>
                <p className="text-gray-600 capitalize">{order.payment_method}</p>
              </div>
              <div>
                <span className="font-medium">Order Date:</span>
                <p className="text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Items Ordered:</h3>
              <div className="space-y-2">
                {order.order_items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.products.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">What's Next?</h4>
                <p className="text-blue-700 text-sm">
                  We'll send you an email confirmation shortly. Your order will be processed and shipped within 2-3 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate('/account')} variant="outline">
          View Orders
        </Button>
        <Button onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
