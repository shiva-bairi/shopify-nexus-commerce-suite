
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Menu, User, Heart, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: cartCount } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity');
      if (error) throw error;
      return data.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      if (error) return false;
      return data;
    },
    enabled: !!user
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            ShopEase
          </Link>

          {/* Search bar - hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/account">
                    <User className="h-5 w-5" />
                    <span className="sr-only md:not-sr-only md:ml-2">Account</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/account?tab=wishlist">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only md:not-sr-only md:ml-2">Wishlist</span>
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only md:not-sr-only md:ml-2">Admin</span>
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild className="relative">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartCount}
                      </Badge>
                    )}
                    <span className="sr-only md:not-sr-only md:ml-2">Cart</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-4">
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>
                  
                  <nav className="flex flex-col space-y-2">
                    <Link to="/" className="text-lg font-medium">Home</Link>
                    <Link to="/products" className="text-lg font-medium">Products</Link>
                    {user ? (
                      <>
                        <Link to="/account" className="text-lg font-medium">Account</Link>
                        <Link to="/cart" className="text-lg font-medium">Cart</Link>
                        {isAdmin && (
                          <Link to="/admin" className="text-lg font-medium">Admin</Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="text-lg font-medium">Sign In</Link>
                        <Link to="/signup" className="text-lg font-medium">Sign Up</Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 py-2 border-t">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
            All Products
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
