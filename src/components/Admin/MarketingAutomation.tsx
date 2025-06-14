
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
import { Switch } from '@/components/ui/switch';
import { Plus, Zap, Edit, Trash2, Play, Pause, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_conditions: any;
  action_type: string;
  action_config: any;
  delay_hours: number;
  is_active: boolean;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  template_type: string;
}

const MarketingAutomation = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch automation rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AutomationRule[];
    }
  });

  // Fetch email templates for action configuration
  const { data: templates } = useQuery({
    queryKey: ['email-templates-for-automation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, template_type')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Create/Update rule mutation
  const ruleMutation = useMutation({
    mutationFn: async (ruleData: Partial<AutomationRule>) => {
      if (selectedRule) {
        const { data, error } = await supabase
          .from('automation_rules')
          .update(ruleData)
          .eq('id', selectedRule.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('automation_rules')
          .insert([ruleData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setIsDialogOpen(false);
      setSelectedRule(null);
      toast({
        title: "Success",
        description: `Automation rule ${selectedRule ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedRule ? 'update' : 'create'} rule: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Toggle rule status mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({
        title: "Success",
        description: "Automation rule status updated",
      });
    }
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({
        title: "Success",
        description: "Automation rule deleted successfully",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Build trigger conditions based on trigger type
    let triggerConditions = {};
    const triggerType = formData.get('trigger_type') as string;
    
    if (triggerType === 'abandoned_cart') {
      triggerConditions = {
        min_cart_value: parseFloat(formData.get('min_cart_value') as string) || 0
      };
    }

    // Build action config
    const actionConfig = {
      template_id: (formData.get('template_id') as string) || null,
      subject: formData.get('subject') as string,
      content: formData.get('content') as string
    };

    const ruleData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      trigger_type: triggerType,
      trigger_conditions: triggerConditions,
      action_type: formData.get('action_type') as string,
      action_config: actionConfig,
      delay_hours: parseInt(formData.get('delay_hours') as string) || 0,
      is_active: formData.get('is_active') === 'on'
    };

    ruleMutation.mutate(ruleData);
  };

  const openEditDialog = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedRule(null);
    setIsDialogOpen(true);
  };

  const triggerTypes = [
    { value: 'abandoned_cart', label: 'Abandoned Cart' },
    { value: 'welcome', label: 'New Customer Welcome' },
    { value: 'order_placed', label: 'Order Placed' },
    { value: 'birthday', label: 'Customer Birthday' },
    { value: 'winback', label: 'Win-back Campaign' }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'add_to_segment', label: 'Add to Segment' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Marketing Automation</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rule Name</label>
                  <Input
                    name="name"
                    required
                    defaultValue={selectedRule?.name || ''}
                    placeholder="e.g., Abandoned Cart Recovery"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Delay (Hours)</label>
                  <Input
                    name="delay_hours"
                    type="number"
                    min="0"
                    defaultValue={selectedRule?.delay_hours || 0}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  defaultValue={selectedRule?.description || ''}
                  placeholder="Brief description of the automation rule..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trigger Type</label>
                  <Select name="trigger_type" defaultValue={selectedRule?.trigger_type || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Action Type</label>
                  <Select name="action_type" defaultValue={selectedRule?.action_type || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditional fields based on trigger type */}
              <div>
                <label className="text-sm font-medium">Minimum Cart Value (for Abandoned Cart)</label>
                <Input
                  name="min_cart_value"
                  type="number"
                  step="0.01"
                  defaultValue={selectedRule?.trigger_conditions?.min_cart_value || ''}
                  placeholder="0.00"
                />
              </div>

              {/* Action configuration */}
              <div>
                <label className="text-sm font-medium">Email Template (Optional)</label>
                <Select name="template_id" defaultValue={selectedRule?.action_config?.template_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template or create custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom email content</SelectItem>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Email Subject</label>
                <Input
                  name="subject"
                  defaultValue={selectedRule?.action_config?.subject || ''}
                  placeholder="Email subject line"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Content</label>
                <Textarea
                  name="content"
                  defaultValue={selectedRule?.action_config?.content || ''}
                  placeholder="Email content (HTML supported, use {{variables}} for personalization)"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  name="is_active"
                  id="is_active"
                  defaultChecked={selectedRule?.is_active !== false}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active Rule
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={ruleMutation.isPending}>
                  {ruleMutation.isPending ? 'Saving...' : 'Save Rule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading automation rules...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules?.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => 
                        toggleMutation.mutate({ id: rule.id, is_active: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Trigger:</span>
                    <Badge variant="outline">
                      {triggerTypes.find(t => t.value === rule.trigger_type)?.label || rule.trigger_type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Action:</span>
                    <Badge variant="outline">
                      {actionTypes.find(a => a.value === rule.action_type)?.label || rule.action_type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Delay:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {rule.delay_hours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
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

export default MarketingAutomation;
