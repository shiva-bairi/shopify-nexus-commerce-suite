
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Edit, Trash2, Truck, MapPin, Package, Settings } from 'lucide-react';

const AdminShipping = () => {
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shippingMethods, isLoading } = useQuery({
    queryKey: ['admin-shipping-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createMethodMutation = useMutation({
    mutationFn: async (methodData: any) => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .insert(methodData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] });
      setShowMethodForm(false);
      setEditingMethod(null);
      toast({
        title: "Success",
        description: "Shipping method created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create shipping method.",
        variant: "destructive",
      });
    }
  });

  const updateMethodMutation = useMutation({
    mutationFn: async ({ id, ...methodData }: any) => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .update(methodData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] });
      setShowMethodForm(false);
      setEditingMethod(null);
      toast({
        title: "Success",
        description: "Shipping method updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update shipping method.",
        variant: "destructive",
      });
    }
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] });
      toast({
        title: "Success",
        description: "Shipping method deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete shipping method.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const methodData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      estimated_days: parseInt(formData.get('estimated_days') as string),
      is_active: formData.get('is_active') === 'on',
    };

    if (editingMethod) {
      updateMethodMutation.mutate({ id: editingMethod.id, ...methodData });
    } else {
      createMethodMutation.mutate(methodData);
    }
  };

  return (
    <Tabs defaultValue="methods" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="methods">Shipping Methods</TabsTrigger>
        <TabsTrigger value="zones">Shipping Zones</TabsTrigger>
        <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
      </TabsList>

      <TabsContent value="methods">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Methods
              </CardTitle>
              <Button onClick={() => {
                setEditingMethod(null);
                setShowMethodForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showMethodForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    {editingMethod ? 'Edit Shipping Method' : 'Add New Shipping Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Method Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Standard Shipping"
                          defaultValue={editingMethod?.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue={editingMethod?.price}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimated_days">Estimated Delivery (days)</Label>
                        <Input
                          id="estimated_days"
                          name="estimated_days"
                          type="number"
                          placeholder="3-5"
                          defaultValue={editingMethod?.estimated_days}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={editingMethod?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Method description..."
                        defaultValue={editingMethod?.description}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createMethodMutation.isPending || updateMethodMutation.isPending}>
                        {(createMethodMutation.isPending || updateMethodMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {editingMethod ? 'Update' : 'Create'} Method
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowMethodForm(false);
                          setEditingMethod(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingMethods?.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>${Number(method.price).toFixed(2)}</TableCell>
                      <TableCell>
                        {method.estimated_days ? `${method.estimated_days} days` : 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          method.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {method.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMethod(method);
                              setShowMethodForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this shipping method?')) {
                                deleteMethodMutation.mutate(method.id);
                              }
                            }}
                            disabled={deleteMethodMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="zones">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Shipping zones configuration will be implemented here.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tracking">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Real-time order tracking dashboard will be implemented here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminShipping;
