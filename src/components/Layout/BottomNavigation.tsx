
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, User, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Get cart count
  const { data: cartCount = 0 } = useQuery({
    queryKey: ['cart-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);
      
      if (error) return 0;
      return data.reduce((total, item) => total + item.quantity, 0);
    },
    enabled: !!user
  });

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home
    },
    {
      label: 'Products',
      path: '/products',
      icon: Package
    },
    {
      label: 'Search',
      path: '/products',
      icon: Search
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
      requireAuth: true
    },
    {
      label: 'Account',
      path: user ? '/account' : '/login',
      icon: User
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const shouldShow = (item: any) => {
    if (item.requireAuth && !user) return false;
    return true;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.filter(shouldShow).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 relative transition-colors ${
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition-transform`} />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium truncate ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
