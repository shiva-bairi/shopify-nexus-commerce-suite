
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  avg_rating: number;
  is_featured: boolean;
  product_images: { image_url: string; is_primary: boolean }[];
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      console.log('🏠 Fetching featured products for home page...');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          discount_price,
          avg_rating,
          is_featured,
          product_images(image_url, is_primary)
        `)
        .eq('is_featured', true)
        .limit(6);

      if (error) {
        console.error('❌ Error fetching featured products:', error);
      } else {
        console.log('✅ Featured products loaded successfully:', data?.length || 0);
        setFeaturedProducts(data || []);
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to ShopNexus
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Your shopping experience just got better.
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out our handpicked selection of the best products just for you.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
              
              return (
                <Card key={product.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={primaryImage?.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                      />
                      {product.discount_price && (
                        <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                          Sale
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-3 line-clamp-2 min-h-[3rem]">{product.name}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                    <div className="flex items-center mb-3">
                      {renderStars(Math.round(product.avg_rating))}
                      <span className="ml-2 text-sm text-gray-600">({product.avg_rating.toFixed(1)})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.discount_price ? (
                        <>
                          <span className="text-2xl font-bold text-red-600">
                            ${product.discount_price}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            ${product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Link to={`/products/${product.id}`} className="w-full">
                      <Button className="w-full text-lg py-3">View Product</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ShopNexus?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50. Fast and reliable delivery worldwide.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">30-day money-back guarantee. We stand behind the quality of our products.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-6.364 15.364 9.75-9.75 0 016.364-15.364z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support. We're here to help whenever you need us.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ShopNexus for their shopping needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg">Browse All Products</Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms-and-conditions" className="hover:text-gray-300">
              Terms & Conditions
            </Link>
            <Link to="/privacy-policy" className="hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link to="/refund-policy" className="hover:text-gray-300">
              Refund Policy
            </Link>
            <Link to="/shipping-policy" className="hover:text-gray-300">
              Shipping Policy
            </Link>
          </div>
          <div className="text-center mt-4 text-gray-400">
            <p>&copy; 2024 ShopNexus. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
