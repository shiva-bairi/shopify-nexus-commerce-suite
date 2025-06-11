
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Package, Users, Bell, LifeBuoy } from 'lucide-react';

const QuickActions = () => {
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    stock: '',
    description: ''
  });
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof productData) => {
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          description: data.description,
          is_featured: false
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      setShowProductDialog(false);
      setProductData({ name: '', price: '', stock: '', description: '' });
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: async () => {
      // Get all users to send notification to
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');
      
      if (usersError) throw usersError;
      
      // Create notifications for all users
      const notifications = users.map(user => ({
        user_id: user.id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setShowNotificationDialog(false);
      setNotificationData({ title: '', message: '', type: 'info' });
      toast({
        title: "Success",
        description: "Notification sent to all users.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive",
      });
    }
  });

  const handleCreateProduct = () => {
    if (!productData.name || !productData.price || !productData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(productData);
  };

  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createNotificationMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Package className="h-6 w-6" />
                <span className="text-sm">Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productData.name}
                    onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productData.stock}
                    onChange={(e) => setProductData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                  />
                </div>
                <Button 
                  onClick={handleCreateProduct} 
                  disabled={createProductMutation.isPending}
                  className="w-full"
                >
                  {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Bell className="h-6 w-6" />
                <span className="text-sm">Send Alert</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification to All Users</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={notificationData.message}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={notificationData.type} onValueChange={(value) => setNotificationData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSendNotification} 
                  disabled={createNotificationMutation.isPending}
                  className="w-full"
                >
                  {createNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => window.open('/products', '_blank')}
          >
            <Package className="h-6 w-6" />
            <span className="text-sm">View Store</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => console.log('Opening support center...')}
          >
            <LifeBuoy className="h-6 w-6" />
            <span className="text-sm">Support</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
