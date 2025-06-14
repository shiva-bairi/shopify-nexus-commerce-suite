
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Clock, User } from 'lucide-react';

interface OrderTimelineProps {
  orderId: string;
  timeline: Array<{
    id: string;
    status: string;
    description: string | null;
    created_at: string;
    created_by: string | null;
    metadata: any;
  }>;
}

const OrderTimeline = ({ orderId, timeline }: OrderTimelineProps) => {
  const [newStatus, setNewStatus] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTimelineEntry = useMutation({
    mutationFn: async ({ status, description }: { status: string; description: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('order_timeline')
        .insert({
          order_id: orderId,
          status,
          description,
          created_by: user.user?.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setNewStatus('');
      setDescription('');
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Timeline entry added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add timeline entry.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus.trim()) return;
    addTimelineEntry.mutate({ status: newStatus, description });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Order Timeline</h4>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_placed">Order Placed</SelectItem>
              <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="picked">Picked</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Add description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!newStatus.trim()}>
              Add Entry
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {timeline.map((entry) => (
          <div key={entry.id} className="flex items-start space-x-3 p-3 border rounded-lg">
            <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{entry.status.replace('_', ' ').toUpperCase()}</span>
                <span className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
              {entry.description && (
                <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
              )}
              {entry.created_by && (
                <div className="flex items-center space-x-1 mt-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">by {entry.created_by.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {timeline.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No timeline entries yet
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTimeline;
