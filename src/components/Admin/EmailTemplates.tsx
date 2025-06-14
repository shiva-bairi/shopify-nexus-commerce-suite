
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
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

const EmailTemplates = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Create/Update template mutation
  const templateMutation = useMutation({
    mutationFn: async (templateData: Partial<EmailTemplate>) => {
      if (selectedTemplate) {
        const { data, error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('email_templates')
          .insert([templateData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: `Template ${selectedTemplate ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedTemplate ? 'update' : 'create'} template: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const templateData = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      html_content: formData.get('html_content') as string,
      template_type: formData.get('template_type') as string,
      is_active: formData.get('is_active') === 'on'
    };

    templateMutation.mutate(templateData);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'abandoned_cart', label: 'Abandoned Cart' },
    { value: 'order_confirmation', label: 'Order Confirmation' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'winback', label: 'Win-back Campaign' },
    { value: 'birthday', label: 'Birthday Special' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Edit Template' : 'Create New Email Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    name="name"
                    required
                    defaultValue={selectedTemplate?.name || ''}
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Template Type</label>
                  <Select name="template_type" defaultValue={selectedTemplate?.template_type || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  name="subject"
                  required
                  defaultValue={selectedTemplate?.subject || ''}
                  placeholder="Email subject line (use {{variables}} for personalization)"
                />
              </div>

              <div>
                <label className="text-sm font-medium">HTML Content</label>
                <Textarea
                  name="html_content"
                  required
                  defaultValue={selectedTemplate?.html_content || ''}
                  placeholder="HTML email content (use {{variables}} for personalization)"
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={selectedTemplate?.is_active !== false}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active Template
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={templateMutation.isPending}>
                  {templateMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <strong>Subject:</strong> {previewTemplate?.subject}
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: previewTemplate?.html_content || '' }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Type:</span>
                    <Badge variant="outline">
                      {templateTypes.find(t => t.value === template.template_type)?.label || template.template_type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <strong>Subject:</strong> {template.subject}
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

export default EmailTemplates;
