
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
import { Plus, Mail, Edit, Trash2, Send, Eye, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailCampaign {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  status: string;
  subject: string | null;
  content: string;
  target_segment_id: string | null;
  scheduled_at: string | null;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

interface CustomerSegment {
  id: string;
  name: string;
  customer_count: number | null;
}

const EmailCampaigns = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('campaign_type', 'email')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailCampaign[];
    }
  });

  // Fetch customer segments for targeting
  const { data: segments } = useQuery({
    queryKey: ['customer-segments-for-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('id, name, customer_count')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as CustomerSegment[];
    }
  });

  // Create/Update campaign mutation
  const campaignMutation = useMutation({
    mutationFn: async (campaignData: Partial<EmailCampaign>) => {
      if (selectedCampaign) {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .update(campaignData)
          .eq('id', selectedCampaign.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .insert([{ ...campaignData, campaign_type: 'email' }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setIsDialogOpen(false);
      setSelectedCampaign(null);
      toast({
        title: "Success",
        description: `Campaign ${selectedCampaign ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedCampaign ? 'update' : 'create'} campaign: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const campaignData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
      target_segment_id: (formData.get('target_segment_id') as string) || null,
      scheduled_at: formData.get('scheduled_at') ? new Date(formData.get('scheduled_at') as string).toISOString() : null
    };

    campaignMutation.mutate(campaignData);
  };

  const openEditDialog = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedCampaign(null);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Campaigns</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCampaign ? 'Edit Campaign' : 'Create New Email Campaign'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  name="name"
                  required
                  defaultValue={selectedCampaign?.name || ''}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  defaultValue={selectedCampaign?.description || ''}
                  placeholder="Brief description of the campaign..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  name="subject"
                  required
                  defaultValue={selectedCampaign?.subject || ''}
                  placeholder="Email subject line"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Content</label>
                <Textarea
                  name="content"
                  required
                  defaultValue={selectedCampaign?.content || ''}
                  placeholder="Email content (HTML supported)"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Target Segment</label>
                <Select name="target_segment_id" defaultValue={selectedCampaign?.target_segment_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target segment (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All customers</SelectItem>
                    {segments?.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.customer_count || 0} customers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Schedule (Optional)</label>
                <Input
                  name="scheduled_at"
                  type="datetime-local"
                  defaultValue={selectedCampaign?.scheduled_at ? new Date(selectedCampaign.scheduled_at).toISOString().slice(0, 16) : ''}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={campaignMutation.isPending}>
                  {campaignMutation.isPending ? 'Saving...' : 'Save Campaign'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading campaigns...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subject:</span>
                    <span className="font-medium">{campaign.subject}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Sent:</span>
                    <span className="font-medium">{campaign.sent_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Opens:</span>
                    <span className="font-medium">{campaign.open_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Clicks:</span>
                    <span className="font-medium">{campaign.click_count}</span>
                  </div>
                  {campaign.scheduled_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Scheduled:</span>
                      <span className="font-medium">
                        {new Date(campaign.scheduled_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailCampaigns;
