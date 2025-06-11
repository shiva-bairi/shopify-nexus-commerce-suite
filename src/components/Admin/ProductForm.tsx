
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { X, Save, Loader2 } from 'lucide-react';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
}

const ProductForm = ({ product, onClose }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    brand: product?.brand || '',
    is_featured: product?.is_featured || false,
    low_stock_threshold: product?.low_stock_threshold?.toString() || '10',
    sku: product?.sku || '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating product with data:', data);
      
      const productData = {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        brand: data.brand || null,
        is_featured: data.is_featured,
        low_stock_threshold: parseInt(data.low_stock_threshold),
        sku: data.sku || null,
      };

      const { data: result, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      
      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      
      console.log('Product created successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
      onClose();
    },
    onError: (error) => {
      console.error('Create product mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please check all fields.",
        variant: "destructive",
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating product with data:', data);
      
      const productData = {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        brand: data.brand || null,
        is_featured: data.is_featured,
        low_stock_threshold: parseInt(data.low_stock_threshold),
        sku: data.sku || null,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select();
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      console.log('Product updated successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      onClose();
    },
    onError: (error) => {
      console.error('Update product mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please check all fields.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid stock quantity (0 or greater).",
        variant: "destructive",
      });
      return;
    }

    if (product) {
      updateProductMutation.mutate(formData);
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                disabled={isLoading}
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Label htmlFor="price">Price * ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
                disabled={isLoading}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                required
                disabled={isLoading}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                disabled={isLoading}
                placeholder="Enter SKU"
              />
            </div>
            <div>
              <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                disabled={isLoading}
                placeholder="10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              disabled={isLoading}
              placeholder="Enter product description"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleChange('is_featured', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="is_featured">Featured Product</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {product ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
