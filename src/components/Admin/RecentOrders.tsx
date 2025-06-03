
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ShoppingCart } from 'lucide-react';

interface RecentOrdersProps {
  recentOrders: Array<{
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    profiles?: {
      first_name: string;
      last_name: string;
    };
  }> | undefined;
}

const RecentOrders = ({ recentOrders }: RecentOrdersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {order.profiles?.first_name} {order.profiles?.last_name || 'Customer'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${Number(order.total_amount).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent orders</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
