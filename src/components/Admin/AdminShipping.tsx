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
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [showZoneMethodModal, setShowZoneMethodModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Shipping methods
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

  // Shipping zones
  const { data: shippingZones, isLoading: zonesLoading } = useQuery({
    queryKey: ['admin-shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // All shipping methods (for attaching to shipping zone)
  const { data: allMethods, isLoading: methodsLoading } = useQuery({
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

  // Shipping zone <-> methods associations
  const { data: zoneMethods, refetch: refetchZoneMethods } = useQuery({
    queryKey: ['admin-shipping-zone-methods', selectedZone?.id],
    queryFn: async () => {
      if (!selectedZone?.id) return [];
      const { data, error } = await supabase
        .from('shipping_zone_methods')
        .select('*,shipping_methods(*)')
        .eq('zone_id', selectedZone.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedZone?.id
  });

  // Zone create/update/delete mutations
  const qc = useQueryClient();

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

  // Add/update/delete shipping method in zone
  const addZoneMethodMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { methodId, zoneId, customPrice, customDays } = payload;
      const { data, error } = await supabase
        .from('shipping_zone_methods')
        .insert({
          zone_id: zoneId,
          method_id: methodId,
          price: customPrice,
          estimated_days: customDays
        });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchZoneMethods();
      toast({ title: "Success", description: "Method mapped to zone." });
    }
  });

  const removeZoneMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shipping_zone_methods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchZoneMethods();
      toast({ title: "Success", description: "Method unmapped from zone." });
    }
  });

  // Handle add/edit zone
  const handleZoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const zoneData = {
      name: f.get('name') as string,
      description: f.get('description') as string,
      countries: (f.get('countries') as string)?.split(',').map((s) => s.trim()).filter(Boolean),
      regions: (f.get('regions') as string)?.split(',').map((s) => s.trim()).filter(Boolean),
      is_active: f.get('is_active') === 'on',
    };
    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, ...zoneData });
    } else {
      createZoneMutation.mutate(zoneData);
    }
  };

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

      {/* ---------- SHIPPING METHODS TAB ---------- */}
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

      {/* ---------- SHIPPING ZONES TAB ---------- */}
      <TabsContent value="zones">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Zones
              </CardTitle>
              <Button
                onClick={() => {
                  setShowZoneForm(true);
                  setEditingZone(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showZoneForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    {editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleZoneSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Zone Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., North America"
                          defaultValue={editingZone?.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="countries">Countries (comma separated ISO codes)</Label>
                        <Input
                          id="countries"
                          name="countries"
                          placeholder="e.g., US,CA,MX"
                          defaultValue={editingZone?.countries?.join(',')}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="regions">Regions/States (optional, comma separated)</Label>
                        <Input
                          id="regions"
                          name="regions"
                          placeholder="e.g., California, Texas"
                          defaultValue={editingZone?.regions?.join(',')}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={editingZone?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Zone description..."
                        defaultValue={editingZone?.description}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createZoneMutation.isPending || updateZoneMutation.isPending}>
                        {(createZoneMutation.isPending || updateZoneMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {editingZone ? 'Update' : 'Create'} Zone
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowZoneForm(false);
                          setEditingZone(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            {zonesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Countries</TableHead>
                    <TableHead>Regions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingZones?.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>{Array.isArray(zone.countries) ? zone.countries.join(', ') : ''}</TableCell>
                      <TableCell>{Array.isArray(zone.regions) ? zone.regions.join(', ') : ''}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          zone.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingZone(zone);
                              setShowZoneForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Delete this zone?')) deleteZoneMutation.mutate(zone.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedZone(zone);
                              setShowZoneMethodModal(true);
                            }}
                          >
                            <Settings className="h-4 w-4" /> Methods
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

        {/* MODAL to manage methods in the zone */}
        {showZoneMethodModal && selectedZone && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded shadow-xl w-full max-w-lg p-6 relative">
              <button
                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
                onClick={() => { setShowZoneMethodModal(false); setSelectedZone(null); }}
              >
                <span className="text-gray-400">✕</span>
              </button>
              <h2 className="text-lg font-bold mb-3">
                Methods for Zone: {selectedZone.name}
              </h2>
              {methodsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {/* List methods already mapped */}
                  <Table className="mb-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shipping Method</TableHead>
                        <TableHead>Custom Price</TableHead>
                        <TableHead>Custom ETA</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zoneMethods?.length ? zoneMethods.map((zm) =>
                        <TableRow key={zm.id}>
                          <TableCell>{zm.shipping_methods?.name}</TableCell>
                          <TableCell>
                            {zm.price !== null && zm.price !== undefined ? `$${Number(zm.price).toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell>
                            {zm.estimated_days ? `${zm.estimated_days} days` : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeZoneMethodMutation.mutate(zm.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400">No methods mapped yet</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Add mapping to a new method */}
                  <form
                    className="flex gap-2"
                    onSubmit={e => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const methodId = fd.get('methodId') as string;
                      if (!methodId) return;
                      const customPriceStr = fd.get('customPrice') as string;
                      const customDaysStr = fd.get('customDays') as string;
                      addZoneMethodMutation.mutate({
                        zoneId: selectedZone.id,
                        methodId,
                        customPrice: customPriceStr ? parseFloat(customPriceStr) : null,
                        customDays: customDaysStr ? parseInt(customDaysStr) : null
                      });
                    }}
                  >
                    <select name="methodId" className="border rounded px-2 py-1">
                      <option value="">Select method...</option>
                      {allMethods?.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <Input
                      name="customPrice"
                      type="number"
                      step="0.01"
                      placeholder="Custom price"
                      className="w-28"
                    />
                    <Input
                      name="customDays"
                      type="number"
                      placeholder="Days"
                      className="w-24"
                    />
                    <Button size="sm" type="submit">
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </TabsContent>

      {/* ---------- ORDER TRACKING TAB ---------- */}
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
