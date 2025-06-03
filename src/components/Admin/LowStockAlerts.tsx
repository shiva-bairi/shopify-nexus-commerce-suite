
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';

interface LowStockAlertsProps {
  lowStockProducts: Array<{
    name: string;
    stock: number;
    low_stock_threshold: number;
  }> | undefined;
}

const LowStockAlerts = ({ lowStockProducts }: LowStockAlertsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts && lowStockProducts.length > 0 ? (
          <div className="space-y-2">
            {lowStockProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <p className="text-sm text-gray-600">
                    Threshold: {product.low_stock_threshold}
                  </p>
                </div>
                <span className="text-sm font-bold text-orange-600">
                  {product.stock} left
                </span>
              </div>
            ))}
            {lowStockProducts.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                +{lowStockProducts.length - 5} more products with low stock
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No low stock alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;
