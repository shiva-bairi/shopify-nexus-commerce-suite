
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // If route requires no authentication (like login/signup pages)
    if (!requireAuth) {
      // Redirect authenticated users away from auth pages
      if (user) {
        navigate('/');
      }
      return;
    }

    // If route requires authentication but user is not logged in
    if (requireAuth && !user) {
      navigate('/login');
      return;
    }

    // If route requires admin privileges but user is not admin
    if (requireAdmin && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, loading, requireAuth, requireAdmin, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!requireAuth && user) return null;
  if (requireAuth && !user) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
