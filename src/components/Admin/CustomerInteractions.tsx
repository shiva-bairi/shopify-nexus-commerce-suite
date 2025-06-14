
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
import { Plus, MessageSquare, Phone, Mail, ShoppingCart, HeadphonesIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const CustomerInteractions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch interactions
  const { data: interactions, isLoading } = useQuery({
    queryKey: ['customer-interactions', searchTerm, filterType],
    queryFn: async () => {
      let query = supabase
        .from('customer_interactions')
        .select(`
          *,
          profiles!customer_interactions_user_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filterType && filterType !== 'all') {
        query = query.eq('interaction_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Create interaction mutation
  const createInteractionMutation = useMutation({
    mutationFn: async (interactionData) => {
      const { data, error } = await supabase
        .from('customer_interactions')
        .insert([{
          ...interactionData,
          created_by: user?.id
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-interactions'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Interaction logged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to log interaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const interactionData = {
      user_id: formData.get('userId'),
      interaction_type: formData.get('interactionType'),
      notes: formData.get('notes'),
      interaction_data: {
        subject: formData.get('subject'),
        outcome: formData.get('outcome'),
        followUp: formData.get('followUp') === 'on'
      }
    };

    createInteractionMutation.mutate(interactionData);
  };

  const getInteractionIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'purchase': return <ShoppingCart className="h-4 w-4" />;
      case 'support': return <HeadphonesIcon className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getInteractionColor = (type) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'phone': return 'bg-green-100 text-green-600';
      case 'chat': return 'bg-purple-100 text-purple-600';
      case 'purchase': return 'bg-orange-100 text-orange-600';
      case 'support': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Interactions</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Customer Interaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer ID</label>
                <Input
                  name="userId"
                  required
                  placeholder="Customer UUID"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Interaction Type</label>
                <Select name="interactionType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="chat">Live Chat</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="support">Support Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  name="subject"
                  placeholder="Brief subject line"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  name="notes"
                  required
                  placeholder="Detailed notes about the interaction..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Input
                  name="outcome"
                  placeholder="Result or resolution"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="followUp"
                  id="followUp"
                  className="rounded"
                />
                <label htmlFor="followUp" className="text-sm">Requires follow-up</label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createInteractionMutation.isPending}>
                  {createInteractionMutation.isPending ? 'Logging...' : 'Log Interaction'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Interactions</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search interactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading interactions...</div>
          ) : (
            <div className="space-y-4">
              {interactions?.map((interaction) => (
                <div key={interaction.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-full ${getInteractionColor(interaction.interaction_type)}`}>
                    {getInteractionIcon(interaction.interaction_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {interaction.profiles?.first_name} {interaction.profiles?.last_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {interaction.interaction_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(interaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {interaction.interaction_data?.subject && (
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {interaction.interaction_data.subject}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">{interaction.notes}</p>
                    {interaction.interaction_data?.outcome && (
                      <p className="text-xs text-green-600 mt-2">
                        Outcome: {interaction.interaction_data.outcome}
                      </p>
                    )}
                    {interaction.interaction_data?.followUp && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Follow-up required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInteractions;
