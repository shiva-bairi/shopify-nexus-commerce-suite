
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, ShoppingCart, Percent } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Deals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('discount');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals', searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(image_url, is_primary)
        `)
        .not('discount_price', 'is', null);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (sortBy === 'discount') {
        query = query.order('discount_price', { ascending: true });
      } else if (sortBy === 'savings') {
        // Order by the difference between price and discount_price
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('name');
      } else if (sortBy === 'rating') {
        query = query.order('avg_rating', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

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

  const calculateSavings = (originalPrice: number, discountPrice: number) => {
    return ((originalPrice - discountPrice) / originalPrice * 100).toFixed(0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Percent className="h-8 w-8 mr-3 text-red-500" />
        <h1 className="text-3xl font-bold">Hot Deals & Discounts</h1>
      </div>
      
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="discount">Lowest Price</SelectItem>
            <SelectItem value="savings">Highest Savings</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deals?.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                  {calculateSavings(product.price, product.discount_price)}% OFF
                </div>
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
                  <span className="text-lg font-bold text-red-600">
                    ${product.discount_price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price}
                  </span>
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

              <div className="mb-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Save ${(product.price - product.discount_price).toFixed(2)}
                </Badge>
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

      {deals?.length === 0 && (
        <div className="text-center py-12">
          <Percent className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No deals found.</p>
          <p className="text-gray-400">Check back later for exciting offers!</p>
        </div>
      )}
    </div>
  );
};

export default Deals;
