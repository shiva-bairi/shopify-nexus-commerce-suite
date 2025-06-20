
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle, Package, Plus, Minus } from 'lucide-react';

const AdminInventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      console.log('Fetching inventory data...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, low_stock_threshold, brand, sku')
        .order('stock', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }
      
      console.log('Inventory data fetched:', data);
      return data;
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, newStock }: { productId: string; newStock: number }) => {
      console.log('Starting stock update for product:', productId, 'new stock:', newStock);
      
      try {
        // First check current user
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user?.id);
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Update only the specific product with explicit WHERE clause
        const { data, error } = await supabase
          .from('products')
          .update({ 
            stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId)
          .select('id, name, stock');
        
        if (error) {
          console.error('Stock update error:', error);
          throw new Error(`Failed to update stock: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          throw new Error('No product was updated - product not found');
        }
        
        console.log('Stock updated successfully for product:', data[0]);
        return data[0];
      } catch (error) {
        console.error('Stock update mutation error:', error);
        throw error;
      }
    },
    onSuccess: (updatedProduct) => {
      console.log('Stock update successful for product:', updatedProduct.id);
      
      // Update the specific product in the cache instead of invalidating all queries
      queryClient.setQueryData(['admin-inventory'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((product: any) => 
          product.id === updatedProduct.id 
            ? { ...product, stock: updatedProduct.stock }
            : product
        );
      });

      // Also update the admin-products cache if it exists
      queryClient.setQueryData(['admin-products'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((product: any) => 
          product.id === updatedProduct.id 
            ? { ...product, stock: updatedProduct.stock }
            : product
        );
      });

      toast({
        title: "Success",
        description: `Stock updated for ${updatedProduct.name}`,
      });
    },
    onError: (error: Error) => {
      console.error('Stock update failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update stock.",
        variant: "destructive",
      });
    }
  });

  const handleStockUpdate = (productId: string, currentStock: number, adjustment: number) => {
    const newStock = Math.max(0, currentStock + adjustment);
    console.log('Handling stock update:', { productId, currentStock, adjustment, newStock });
    
    // Prevent multiple simultaneous updates
    if (updateStockMutation.isPending) {
      console.log('Stock update already in progress, ignoring request');
      return;
    }
    
    updateStockMutation.mutate({
      productId,
      newStock
    });
  };

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

      {/* Inventory Management */}
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
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockUpdate(product.id, product.stock, -1)}
                        disabled={product.stock === 0 || updateStockMutation.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockUpdate(product.id, product.stock, 1)}
                        disabled={updateStockMutation.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInventory;
