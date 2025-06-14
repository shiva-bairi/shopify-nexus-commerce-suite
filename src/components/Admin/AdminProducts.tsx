
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Plus, Edit, Trash2, Package, Star, StarOff, Image } from 'lucide-react';
import ProductForm from './ProductForm';
import AdminInventory from './AdminInventory';
import AdminCoupons from './AdminCoupons';
import ProductStockManager from './ProductStockManager';
import ProductImageManager from './ProductImageManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  low_stock_threshold: number;
}

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForImages, setSelectedProductForImages] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ productId, isFeatured }: { productId: string; isFeatured: boolean }) => {
      console.log('Toggling featured status for product:', productId, 'current:', isFeatured);
      
      const { data, error } = await supabase
        .from('products')
        .update({ 
          is_featured: !isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select('id, is_featured')
        .single();
      
      if (error) {
        console.error('Toggle featured error:', error);
        throw new Error(`Failed to update featured status: ${error.message}`);
      }
      
      console.log('Featured status updated:', data);
      return data;
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(['admin-products', searchQuery], (oldData: Product[]) => {
        if (!oldData) return oldData;
        return oldData.map(product => 
          product.id === updatedProduct.id 
            ? { ...product, is_featured: updatedProduct.is_featured }
            : product
        );
      });
      
      toast({
        title: "Success",
        description: "Product featured status updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Toggle featured mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product featured status.",
        variant: "destructive",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      // Delete associated images first
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);
      
      if (images && images.length > 0) {
        // Delete images from storage
        const filePaths = images.map(img => {
          const urlParts = img.image_url.split('/');
          return urlParts.slice(-2).join('/');
        });
        
        await supabase.storage
          .from('product-images')
          .remove(filePaths);
      }
      
      // Delete product (cascade will handle related records)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
      
      return productId;
    },
    onSuccess: (deletedProductId) => {
      queryClient.setQueryData(['admin-products', searchQuery], (oldData: Product[]) => {
        if (!oldData) return oldData;
        return oldData.filter(product => product.id !== deletedProductId);
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Delete product mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    }
  });

  const handleToggleFeatured = (product: Product) => {
    if (toggleFeaturedMutation.isPending) return;
    
    toggleFeaturedMutation.mutate({ 
      productId: product.id, 
      isFeatured: product.is_featured 
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This will also delete all associated images and cannot be undone.')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
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
                  placeholder="Search products, brands, SKUs..."
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
                    <TableHead>Product</TableHead>
                    <TableHead>Brand/SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{product.brand || 'No brand'}</div>
                          {product.sku && (
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          )}
                        </div>
                      </TableCell>
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
                        <ProductStockManager product={product} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={product.is_featured ? 'default' : 'secondary'}>
                            {product.is_featured ? 'Featured' : 'Regular'}
                          </Badge>
                          {new Date(product.created_at).toLocaleDateString() === new Date().toLocaleDateString() && (
                            <Badge variant="outline" className="text-xs">New</Badge>
                          )}
                        </div>
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
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedProductForImages(product)}
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Manage Product Images</DialogTitle>
                              </DialogHeader>
                              {selectedProductForImages && (
                                <ProductImageManager
                                  productId={selectedProductForImages.id}
                                  productName={selectedProductForImages.name}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          
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
