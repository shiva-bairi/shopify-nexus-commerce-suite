
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Check admin status if required
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id && requireAdmin
  });

  // Show loading while checking auth or admin status
  if (loading || (requireAdmin && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if user is authenticated but shouldn't be (e.g., login page)
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // Check admin access
  if (requireAdmin && user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
