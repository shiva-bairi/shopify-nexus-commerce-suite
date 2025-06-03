
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Edit, Trash2, Percent } from 'lucide-react';

const AdminCoupons = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_until: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          ...data,
          discount_value: parseFloat(data.discount_value),
          min_order_amount: data.min_order_amount ? parseFloat(data.min_order_amount) : null,
          max_discount_amount: data.max_discount_amount ? parseFloat(data.max_discount_amount) : null,
          usage_limit: data.usage_limit ? parseInt(data.usage_limit) : null,
          valid_until: data.valid_until ? new Date(data.valid_until).toISOString() : null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({
        title: "Success",
        description: "Coupon created successfully.",
      });
      setIsCreating(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        valid_until: '',
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create coupon.",
        variant: "destructive",
      });
    }
  });

  const toggleCouponMutation = useMutation({
    mutationFn: async ({ couponId, isActive }: { couponId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !isActive })
        .eq('id', couponId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({
        title: "Success",
        description: "Coupon status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coupon status.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCouponMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Coupon Management
            </CardTitle>
            <Button onClick={() => setIsCreating(!isCreating)}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Cancel' : 'Add Coupon'}
            </Button>
          </div>
        </CardHeader>
        
        {isCreating && (
          <CardContent className="border-t">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Coupon Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g., SAVE20"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.discount_type}
                    onChange={(e) => handleChange('discount_type', e.target.value)}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Value *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => handleChange('discount_value', e.target.value)}
                    placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Minimum Order Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) => handleChange('min_order_amount', e.target.value)}
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Discount Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.max_discount_amount}
                    onChange={(e) => handleChange('max_discount_amount', e.target.value)}
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Usage Limit</label>
                  <Input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => handleChange('usage_limit', e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Valid Until</label>
                  <Input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => handleChange('valid_until', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createCouponMutation.isPending}
                >
                  Create Coupon
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.discount_type}</TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `$${Number(coupon.discount_value).toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.used_count} / {coupon.usage_limit || '∞'}
                  </TableCell>
                  <TableCell>
                    {coupon.valid_until 
                      ? new Date(coupon.valid_until).toLocaleDateString()
                      : 'No expiry'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCouponMutation.mutate({ 
                          couponId: coupon.id, 
                          isActive: coupon.is_active 
                        })}
                        disabled={toggleCouponMutation.isPending}
                      >
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoupons;
