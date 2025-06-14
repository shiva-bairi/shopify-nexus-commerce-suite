
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';

const InventoryAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      console.log('Fetching inventory analytics...');
      
      // Get inventory metrics
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock, low_stock_threshold, price, discount_price');
      
      if (productsError) {
        console.error('Error fetching products for analytics:', productsError);
        throw productsError;
      }

      // Get recent inventory logs
      const { data: recentLogs, error: logsError } = await supabase
        .from('inventory_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (logsError) {
        console.error('Error fetching inventory logs:', logsError);
        throw logsError;
      }

      // Get active alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('inventory_alerts')
        .select('*, products(name)')
        .eq('is_active', true);
      
      if (alertsError) {
        console.error('Error fetching inventory alerts:', alertsError);
        throw alertsError;
      }

      // Calculate metrics
      const totalProducts = products.length;
      const outOfStock = products.filter(p => p.stock === 0).length;
      const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold).length;
      const totalValue = products.reduce((sum, p) => {
        const price = p.discount_price || p.price;
        return sum + (price * p.stock);
      }, 0);
      
      // Calculate stock turnover (simplified)
      const totalStockMovement = recentLogs.reduce((sum, log) => sum + Math.abs(log.quantity_change), 0);
      
      return {
        totalProducts,
        outOfStock,
        lowStock,
        totalValue,
        totalStockMovement,
        recentLogs,
        alerts,
        products
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const stockHealthPercentage = ((analytics.totalProducts - analytics.outOfStock - analytics.lowStock) / analytics.totalProducts) * 100;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockHealthPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Products adequately stocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Movement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStockMovement}</div>
            <p className="text-xs text-muted-foreground">
              Units moved recently
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Summary */}
      {analytics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Inventory Alerts ({analytics.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{alert.products?.name || 'Unknown Product'}</span>
                    <Badge 
                      variant={alert.alert_type === 'out_of_stock' ? 'destructive' : 'outline'}
                      className="ml-2"
                    >
                      {alert.alert_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    Threshold: {alert.threshold_value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentLogs.length > 0 ? (
              analytics.recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {log.change_type === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {log.change_type === 'increase' ? '+' : ''}{log.quantity_change} units
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{log.previous_stock} → {log.new_stock}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent stock activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAnalytics;
