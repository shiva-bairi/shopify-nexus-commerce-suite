
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Package, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ProductStockManagerProps {
  product: {
    id: string;
    name: string;
    stock: number;
    low_stock_threshold: number;
  };
}

const ProductStockManager = ({ product }: ProductStockManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStockMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      newStock, 
      changeType, 
      notes 
    }: { 
      productId: string; 
      newStock: number; 
      changeType: 'increase' | 'decrease' | 'adjustment';
      notes?: string;
    }) => {
      console.log('Updating stock for product:', productId, 'new stock:', newStock);
      
      // Start a transaction to ensure data consistency
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update product stock
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select('id, name, stock')
        .single();
      
      if (updateError) {
        console.error('Stock update error:', updateError);
        throw new Error(`Failed to update stock: ${updateError.message}`);
      }
      
      // Log the inventory change
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: productId,
          change_type: changeType,
          quantity_change: newStock - product.stock,
          previous_stock: product.stock,
          new_stock: newStock,
          notes: notes || `Stock ${changeType} via admin panel`
        });
      
      if (logError) {
        console.warn('Failed to log inventory change:', logError);
        // Don't throw error for logging failure
      }
      
      return updatedProduct;
    },
    onSuccess: (updatedProduct) => {
      console.log('Stock update successful:', updatedProduct);
      
      // Update all relevant caches
      queryClient.setQueryData(['admin-products'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((p: any) => 
          p.id === updatedProduct.id 
            ? { ...p, stock: updatedProduct.stock }
            : p
        );
      });

      queryClient.setQueryData(['admin-inventory'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((p: any) => 
          p.id === updatedProduct.id 
            ? { ...p, stock: updatedProduct.stock }
            : p
        );
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      
      toast({
        title: "Stock Updated",
        description: `${updatedProduct.name} stock updated to ${updatedProduct.stock}`,
      });
      
      setIsOpen(false);
      setStockAdjustment(0);
      setNotes('');
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

  const handleQuickAdjustment = (adjustment: number) => {
    const newStock = Math.max(0, product.stock + adjustment);
    const changeType = adjustment > 0 ? 'increase' : 'decrease';
    
    updateStockMutation.mutate({
      productId: product.id,
      newStock,
      changeType,
      notes: `Quick ${changeType} of ${Math.abs(adjustment)} units`
    });
  };

  const handleStockAdjustment = () => {
    if (stockAdjustment === 0) return;
    
    const newStock = Math.max(0, product.stock + stockAdjustment);
    const changeType = stockAdjustment > 0 ? 'increase' : 'decrease';
    
    updateStockMutation.mutate({
      productId: product.id,
      newStock,
      changeType,
      notes
    });
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (product.stock <= product.low_stock_threshold) {
      return { status: 'Low Stock', variant: 'outline' as const, icon: AlertTriangle };
    } else {
      return { status: 'In Stock', variant: 'secondary' as const, icon: Package };
    }
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={stockStatus.variant} className="flex items-center gap-1">
        <StatusIcon className="h-3 w-3" />
        {product.stock} in stock
      </Badge>
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickAdjustment(-1)}
          disabled={product.stock === 0 || updateStockMutation.isPending}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickAdjustment(1)}
          disabled={updateStockMutation.isPending}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">
            <Package className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Stock: {product.name}</DialogTitle>
            <DialogDescription>
              Current stock: {product.stock} units
              {product.stock <= product.low_stock_threshold && (
                <span className="text-orange-600 ml-2">(Low stock threshold: {product.low_stock_threshold})</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="adjustment">Stock Adjustment</Label>
              <Input
                id="adjustment"
                type="number"
                value={stockAdjustment}
                onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                placeholder="Enter positive or negative number"
              />
              <p className="text-sm text-gray-500 mt-1">
                New stock will be: {Math.max(0, product.stock + stockAdjustment)}
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for stock adjustment"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleStockAdjustment}
                disabled={stockAdjustment === 0 || updateStockMutation.isPending}
                className="flex-1"
              >
                {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductStockManager;
