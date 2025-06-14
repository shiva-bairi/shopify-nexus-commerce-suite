
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductStockManager from './ProductStockManager';
import InventoryAnalytics from './InventoryAnalytics';

const AdminInventory = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      console.log('Fetching inventory data...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, low_stock_threshold, brand, sku, price, discount_price')
        .order('stock', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }
      
      console.log('Inventory data fetched:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const criticalStock = products?.filter(p => p.stock === 0) || [];
  const lowStock = products?.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold) || [];

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="management">Stock Management</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="space-y-6">
          {/* Stock Alerts */}
          {(criticalStock.length > 0 || lowStock.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalStock.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Out of Stock ({criticalStock.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {criticalStock.map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm font-medium">{product.name}</span>
                            <Badge variant="destructive">0 stock</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {lowStock.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">Low Stock ({lowStock.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {lowStock.map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                            <span className="text-sm font-medium">{product.name}</span>
                            <Badge variant="outline" className="text-orange-600">
                              {product.stock} left
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalStock.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStock.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="management">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku || 'N/A'}</TableCell>
                    <TableCell>{product.brand || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          ${(product.discount_price || product.price).toFixed(2)}
                        </span>
                        {product.discount_price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        product.stock === 0 ? 'text-red-600' : 
                        product.stock <= product.low_stock_threshold ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.low_stock_threshold}</TableCell>
                    <TableCell>
                      <Badge variant={
                        product.stock === 0 ? 'destructive' : 
                        product.stock <= product.low_stock_threshold ? 'outline' : 
                        'secondary'
                      }>
                        {product.stock === 0 ? 'Out of Stock' : 
                         product.stock <= product.low_stock_threshold ? 'Low Stock' : 
                         'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ProductStockManager product={product} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <InventoryAnalytics />
      </TabsContent>
    </Tabs>
  );
};

export default AdminInventory;
