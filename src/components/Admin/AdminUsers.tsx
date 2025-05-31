
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, Shield, ShieldOff } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  email?: string | null;
  is_admin?: boolean;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*');

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
      }

      const { data: profiles, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Get admin status for each user
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id');
      
      if (adminError) throw adminError;

      const adminUserIds = new Set(adminUsers?.map(admin => admin.user_id) || []);

      // Get user emails from auth metadata (this is a simplified approach)
      const usersWithAdminStatus = profiles?.map(profile => ({
        ...profile,
        email: null, // We can't easily get email from auth.users via the client
        is_admin: adminUserIds.has(profile.id)
      })) || [];

      return usersWithAdminStatus as Profile[];
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  });

  const handleToggleAdmin = (userId: string, isAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name || user.last_name 
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : 'No name'
                  }
                </TableCell>
                <TableCell>{user.phone || 'No phone'}</TableCell>
                <TableCell>
                  <Badge variant={user.is_admin ? 'destructive' : 'secondary'}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={user.is_admin ? 'outline' : 'default'}
                    onClick={() => handleToggleAdmin(user.id, user.is_admin || false)}
                    disabled={toggleAdminMutation.isPending}
                  >
                    {user.is_admin ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
