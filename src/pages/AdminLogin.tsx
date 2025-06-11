
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if user is admin and redirect accordingly
      checkAdminStatus();
    }
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: isAdmin } = await supabase.rpc('is_admin', { user_uuid: user.id });
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        // If user is logged in but not admin, show them they need admin access
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges. Please contact an administrator.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check if the user is an admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { 
          user_uuid: data.user.id 
        });

        if (adminError) {
          toast({
            title: "Error",
            description: "Failed to verify admin status.",
            variant: "destructive",
          });
          return;
        }

        if (!isAdmin) {
          // Sign out the user if they're not an admin
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this system.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome, Admin!",
          description: "You have been logged in successfully.",
        });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your admin email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
            </Button>
          </form>
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have admin access?{' '}
                <Link to="/admin/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Request admin account
                </Link>
              </p>
            </div>
            <div className="text-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to main site
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
