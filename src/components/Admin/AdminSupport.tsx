import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import KnowledgeBaseForm from './KnowledgeBaseForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  user_id: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  support_messages: Array<{
    id: string;
    message: string;
    user_id: string;
    is_internal: boolean;
    created_at: string;
  }>;
}

const AdminSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [kbSearch, setKbSearch] = useState('');
  const [kbCategory, setKbCategory] = useState('all');
  const [kbStatus, setKbStatus] = useState('all');
  const [kbEdit, setKbEdit] = useState<any | null>(null);
  const [kbDialogOpen, setKbDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', searchQuery, statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          support_messages(
            id,
            message,
            user_id,
            is_internal,
            created_at
          )
        `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: any }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Success",
        description: "Ticket updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket.",
        variant: "destructive",
      });
    }
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message, isInternal = true }: { ticketId: string; message: string; isInternal?: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.user.id,
          message,
          is_internal: isInternal
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setNewMessage('');
      toast({
        title: "Success",
        description: "Message sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default' as const, label: 'Open', icon: AlertCircle },
      in_progress: { variant: 'secondary' as const, label: 'In Progress', icon: Clock },
      resolved: { variant: 'outline' as const, label: 'Resolved', icon: CheckCircle },
      closed: { variant: 'destructive' as const, label: 'Closed', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'outline' as const, label: 'Low' },
      medium: { variant: 'secondary' as const, label: 'Medium' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const { data: kbArticles, isLoading: kbLoading } = useQuery({
    queryKey: ['knowledge-base', kbSearch, kbCategory, kbStatus],
    queryFn: async () => {
      let query = supabase.from('knowledge_base_articles').select('*').order('created_at', { ascending: false });
      if (kbStatus !== 'all')
        query = query.eq('is_active', kbStatus === 'active');
      if (kbCategory !== 'all' && kbCategory !== '')
        query = query.eq('category', kbCategory);
      if (kbSearch)
        query = query.ilike('title', `%${kbSearch}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const upsertKB = useMutation({
    mutationFn: async (kb: any) => {
      if (kbEdit) {
        // update
        const { error } = await supabase.from('knowledge_base_articles').update(kb).eq('id', kbEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('knowledge_base_articles').insert(kb);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Knowledge base updated" });
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      setKbDialogOpen(false);
      setKbEdit(null);
    },
    onError: (e) => toast({ title: "Failed", description: (e as Error).message, variant: "destructive" })
  });

  const deactivateKB = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('knowledge_base_articles').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deactivated knowledge base article" });
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="tickets" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
      </TabsList>
      {/* ------ SUPPORT TICKETS TAB, unchanged except wrap in TabsContent ------ */}
      <TabsContent value="tickets">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Support Tickets</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets?.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">
                        #{ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {ticket.description}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ticket.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Ticket #{ticket.id.slice(0, 8)} - {ticket.subject}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex space-x-4">
                                  <Select
                                    value={ticket.status}
                                    onValueChange={(status) => 
                                      updateTicketMutation.mutate({ 
                                        ticketId: ticket.id, 
                                        updates: { status } 
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-[150px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={ticket.priority}
                                    onValueChange={(priority) => 
                                      updateTicketMutation.mutate({ 
                                        ticketId: ticket.id, 
                                        updates: { priority } 
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-[150px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="border rounded p-4 bg-gray-50">
                                  <h4 className="font-medium mb-2">Original Message</h4>
                                  <p>{ticket.description}</p>
                                </div>

                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {ticket.support_messages.map((message) => (
                                    <div 
                                      key={message.id} 
                                      className={`p-3 rounded ${
                                        message.is_internal 
                                          ? 'bg-blue-50 border-l-4 border-blue-400' 
                                          : 'bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">
                                          {message.is_internal ? 'Internal Note' : 'Customer Message'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(message.created_at).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{message.message}</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-3">
                                  <Textarea
                                    placeholder="Add a response or internal note..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => addMessageMutation.mutate({ 
                                        ticketId: ticket.id, 
                                        message: newMessage, 
                                        isInternal: false 
                                      })}
                                      disabled={!newMessage.trim()}
                                    >
                                      Send Reply
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => addMessageMutation.mutate({ 
                                        ticketId: ticket.id, 
                                        message: newMessage, 
                                        isInternal: true 
                                      })}
                                      disabled={!newMessage.trim()}
                                    >
                                      Add Internal Note
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      {/* ------ KNOWLEDGE BASE TAB ------ */}
      <TabsContent value="kb">
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search articles..."
            value={kbSearch}
            onChange={e => setKbSearch(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Filter by category"
            value={kbCategory === 'all' ? '' : kbCategory}
            onChange={e => setKbCategory(e.target.value || 'all')}
            className="max-w-xs"
          />
          <select
            value={kbStatus}
            onChange={e => setKbStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Dialog
            open={kbDialogOpen}
            onOpenChange={setKbDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setKbEdit(null);
                  setKbDialogOpen(true);
                }}
              >Add Article</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{kbEdit ? 'Edit Article' : 'Add Knowledge Base Article'}</DialogTitle>
              </DialogHeader>
              <KnowledgeBaseForm
                initial={kbEdit ?? {}}
                loading={upsertKB.isPending}
                onSubmit={data => upsertKB.mutate(data)}
                onCancel={() => {
                  setKbDialogOpen(false);
                  setKbEdit(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          {kbLoading ? (
            <div className="flex items-center p-4"><Loader2 className="animate-spin mr-2" /> Loading articles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>FAQ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kbArticles?.map((a: any) => (
                  <TableRow key={a.id} className={a.is_active ? '' : "opacity-60"}>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.category ?? '-'}</TableCell>
                    <TableCell>
                      {a.tags?.length ? a.tags.join(', ') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.is_faq ? "default" : "outline"}>{a.is_faq ? "Yes" : "No"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.is_active ? "default" : "outline"}>
                        {a.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setKbEdit(a);
                                setKbDialogOpen(true);
                              }}
                            >Edit</Button>
                          </DialogTrigger>
                          {/* DialogContent is shared above */}
                        </Dialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deactivateKB.mutate(a.id)}
                          disabled={!a.is_active}
                        >Deactivate</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AdminSupport;
