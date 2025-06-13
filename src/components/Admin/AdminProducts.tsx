
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, Plus, Edit, Trash2, Package, Star, StarOff } from 'lucide-react';
import ProductForm from './ProductForm';
import AdminInventory from './AdminInventory';
import AdminCoupons from './AdminCoupons';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  stock: number;
  brand: string | null;
  is_featured: boolean;
  created_at: string;
  description?: string;
  category_id?: string;
  sku?: string;
}

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ productId, isFeatured }: { productId: string; isFeatured: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          is_featured: !isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Success",
        description: "Product featured status updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Toggle featured mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update product featured status.",
        variant: "destructive",
      });
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, newStock }: { productId: string; newStock: number }) => {
      console.log('Updating stock for product:', productId, 'new stock:', newStock);
      
      const { data, error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select();
      
      if (error) {
        console.error('Stock update error:', error);
        throw error;
      }
      
      console.log('Stock updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Success",
        description: "Product stock updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Update stock mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update product stock.",
        variant: "destructive",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete product mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  });

  const handleToggleFeatured = (product: Product) => {
    toggleFeaturedMutation.mutate({ 
      productId: product.id, 
      isFeatured: product.is_featured 
    });
  };

  const handleStockChange = (product: Product, change: number) => {
    const newStock = Math.max(0, product.stock + change);
    console.log('Handling stock change:', { productId: product.id, currentStock: product.stock, change, newStock });
    updateStockMutation.mutate({ 
      productId: product.id, 
      newStock 
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    handleCloseForm();
  };

  if (showProductForm) {
    return (
      <ProductForm
        product={editingProduct}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="coupons">Coupons</TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Management
              </CardTitle>
              <Button onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand || 'No brand'}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">${Number(product.price).toFixed(2)}</span>
                          {product.discount_price && (
                            <div className="text-sm text-green-600">
                              Sale: ${Number(product.discount_price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.stock > 10 ? 'secondary' : product.stock > 0 ? 'outline' : 'destructive'}>
                            {product.stock} in stock
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockChange(product, -1)}
                              disabled={product.stock === 0 || updateStockMutation.isPending}
                            >
                              -
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockChange(product, 1)}
                              disabled={updateStockMutation.isPending}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_featured ? 'default' : 'secondary'}>
                          {product.is_featured ? 'Featured' : 'Regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(product)}
                            disabled={toggleFeaturedMutation.isPending}
                          >
                            {product.is_featured ? (
                              <>
                                <StarOff className="h-4 w-4 mr-1" />
                                Unfeature
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-1" />
                                Feature
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inventory">
        <AdminInventory />
      </TabsContent>

      <TabsContent value="coupons">
        <AdminCoupons />
      </TabsContent>
    </Tabs>
  );
};

export default AdminProducts;
