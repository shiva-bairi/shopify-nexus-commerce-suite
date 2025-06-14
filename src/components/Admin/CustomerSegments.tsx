
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerSegments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch segments
  const { data: segments, isLoading } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create/Update segment mutation
  const segmentMutation = useMutation({
    mutationFn: async (segmentData) => {
      if (selectedSegment) {
        const { data, error } = await supabase
          .from('customer_segments')
          .update(segmentData)
          .eq('id', selectedSegment.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_segments')
          .insert([segmentData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      setIsDialogOpen(false);
      setSelectedSegment(null);
      toast({
        title: "Success",
        description: `Segment ${selectedSegment ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedSegment ? 'update' : 'create'} segment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete segment mutation
  const deleteMutation = useMutation({
    mutationFn: async (segmentId) => {
      const { error } = await supabase
        .from('customer_segments')
        .delete()
        .eq('id', segmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const criteria = {
      totalSpent: {
        min: formData.get('minSpent') ? parseFloat(formData.get('minSpent')) : null,
        max: formData.get('maxSpent') ? parseFloat(formData.get('maxSpent')) : null
      },
      orderCount: {
        min: formData.get('minOrders') ? parseInt(formData.get('minOrders')) : null,
        max: formData.get('maxOrders') ? parseInt(formData.get('maxOrders')) : null
      },
      loyaltyTier: formData.get('loyaltyTier') || null,
      lastOrderDays: formData.get('lastOrderDays') ? parseInt(formData.get('lastOrderDays')) : null
    };

    segmentMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      criteria: criteria,
      is_active: true
    });
  };

  const openEditDialog = (segment) => {
    setSelectedSegment(segment);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedSegment(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Segments</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedSegment ? 'Edit Segment' : 'Create New Segment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Segment Name</label>
                <Input
                  name="name"
                  required
                  defaultValue={selectedSegment?.name || ''}
                  placeholder="e.g., High Value Customers"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  defaultValue={selectedSegment?.description || ''}
                  placeholder="Describe this segment..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Total Spent ($)</label>
                  <Input
                    name="minSpent"
                    type="number"
                    step="0.01"
                    defaultValue={selectedSegment?.criteria?.totalSpent?.min || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Total Spent ($)</label>
                  <Input
                    name="maxSpent"
                    type="number"
                    step="0.01"
                    defaultValue={selectedSegment?.criteria?.totalSpent?.max || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Orders</label>
                  <Input
                    name="minOrders"
                    type="number"
                    defaultValue={selectedSegment?.criteria?.orderCount?.min || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Orders</label>
                  <Input
                    name="maxOrders"
                    type="number"
                    defaultValue={selectedSegment?.criteria?.orderCount?.max || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Loyalty Tier</label>
                  <Select name="loyaltyTier" defaultValue={selectedSegment?.criteria?.loyaltyTier || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Order (days ago)</label>
                  <Input
                    name="lastOrderDays"
                    type="number"
                    defaultValue={selectedSegment?.criteria?.lastOrderDays || ''}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={segmentMutation.isPending}>
                  {segmentMutation.isPending ? 'Saving...' : 'Save Segment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading segments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments?.map((segment) => (
            <Card key={segment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(segment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customers:</span>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {segment.customer_count || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={segment.is_active ? 'default' : 'secondary'}>
                      {segment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerSegments;
