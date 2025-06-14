
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam === 'true') {
      // Focus on search input when coming from search nav
      const searchInput = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [searchParams]);

  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      console.log('Fetching products with params:', { searchQuery, selectedCategory, sortBy });
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(image_url, is_primary)
        `);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (sortBy === 'name') {
        query = query.order('name');
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'rating') {
        query = query.order('avg_rating', { ascending: false });
      }

      const { data, error } = await query;
      
      console.log('Products query result:', { data, error });
      
      if (error) {
        console.error('Products fetch error:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  const { data: categories, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      console.log('Categories query result:', { data, error });
      
      if (error) {
        console.error('Categories fetch error:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Log any errors
  useEffect(() => {
    if (productsError) {
      console.error('Products error:', productsError);
      toast({
        title: "Error loading products",
        description: "There was an issue loading the products. Please try again.",
        variant: "destructive",
      });
    }
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
    }
  }, [productsError, categoriesError, toast]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;

      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist. It might already be added.",
        variant: "destructive",
      });
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });

      if (error) throw error;

      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart.",
        variant: "destructive",
      });
    }
  };

  const getProductImage = (product: any) => {
    const primaryImage = product.product_images?.find((img: any) => img.is_primary);
    return primaryImage?.image_url || product.product_images?.[0]?.image_url || '/placeholder.svg';
  };

  console.log('Component state:', { 
    productsLoading, 
    productsError, 
    productsCount: products?.length,
    categoriesCount: categories?.length 
  });

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">Error loading products</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      Sale
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addToWishlist(product.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <CardTitle className="text-lg line-clamp-2 mb-2">
                  <Link to={`/products/${product.id}`} className="hover:text-blue-600">
                    {product.name}
                  </Link>
                </CardTitle>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {product.discount_price ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
                          ${product.discount_price}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">${product.price}</span>
                    )}
                  </div>
                  
                  {product.avg_rating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {product.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
