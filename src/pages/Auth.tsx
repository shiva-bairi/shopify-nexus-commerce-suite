
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect home
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Toggle between login and signup
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  // Auth handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      // Sign up the user
      const redirectUrl = `${window.location.origin}/`;
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      if (error) {
        toast({
          title: 'Signup failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'A confirmation email was sent to you.',
        });
        // Optionally auto-assign user role. Uncomment if you want to give new users the "user" role:
        // import { assignRole } from '@/integrations/supabase/userRoles';
        // await assignRole(user.id, 'user');
        setMode('login');
      }
      setLoading(false);
      return;
    }

    // Login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }
    toast({
      title: 'Logged in!',
      description: 'You are now logged in.'
    });
    // Redirect will occur automatically by useEffect
    setLoading(false);
  };

  // Loading state (during auth)
  if (authLoading || loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </CardTitle>
          <div className="flex justify-center gap-2 text-blue-600 font-medium">
            <Button variant={mode === 'login' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('login')} className="gap-1">
              <LogIn className="h-4 w-4" /> Login
            </Button>
            <Button variant={mode === 'signup' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('signup')} className="gap-1">
              <UserPlus className="h-4 w-4" /> Sign Up
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <Label htmlFor="full_name">Name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Signing up...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button type="button" className="text-blue-600 hover:underline" onClick={toggleMode}>Sign Up</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="text-blue-600 hover:underline" onClick={toggleMode}>Log In</button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
