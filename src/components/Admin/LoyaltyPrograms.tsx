
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Award, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TierThresholds {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

interface TierBenefits {
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
}

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string | null;
  points_per_dollar: number | null;
  tier_thresholds: TierThresholds | null;
  tier_benefits: TierBenefits | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface CreateProgramData {
  name: string;
  description: string;
  points_per_dollar: number;
  tier_thresholds: TierThresholds;
  tier_benefits: TierBenefits;
  is_active: boolean;
}

const LoyaltyPrograms = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch loyalty programs
  const { data: programs, isLoading } = useQuery({
    queryKey: ['loyalty-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LoyaltyProgram[];
    }
  });

  // Create/Update program mutation
  const programMutation = useMutation({
    mutationFn: async (programData: CreateProgramData) => {
      if (selectedProgram) {
        const { data, error } = await supabase
          .from('loyalty_programs')
          .update(programData)
          .eq('id', selectedProgram.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('loyalty_programs')
          .insert([programData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      setIsDialogOpen(false);
      setSelectedProgram(null);
      toast({
        title: "Success",
        description: `Program ${selectedProgram ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedProgram ? 'update' : 'create'} program: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete program mutation
  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from('loyalty_programs')
        .delete()
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      toast({
        title: "Success",
        description: "Program deleted successfully",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const tierThresholds: TierThresholds = {
      bronze: 0,
      silver: parseInt((formData.get('silverThreshold') as string)) || 100,
      gold: parseInt((formData.get('goldThreshold') as string)) || 500,
      platinum: parseInt((formData.get('platinumThreshold') as string)) || 1000
    };

    const tierBenefits: TierBenefits = {
      bronze: (formData.get('bronzeBenefits') as string) || 'Basic rewards',
      silver: (formData.get('silverBenefits') as string) || '5% discount',
      gold: (formData.get('goldBenefits') as string) || '10% discount + free shipping',
      platinum: (formData.get('platinumBenefits') as string) || '15% discount + priority support'
    };

    const programData: CreateProgramData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      points_per_dollar: parseFloat((formData.get('pointsPerDollar') as string)) || 1,
      tier_thresholds: tierThresholds,
      tier_benefits: tierBenefits,
      is_active: true
    };

    programMutation.mutate(programData);
  };

  const openEditDialog = (program: LoyaltyProgram) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedProgram(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loyalty Programs</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProgram ? 'Edit Program' : 'Create New Loyalty Program'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Program Name</label>
                <Input
                  name="name"
                  required
                  defaultValue={selectedProgram?.name || ''}
                  placeholder="e.g., VIP Rewards Program"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  defaultValue={selectedProgram?.description || ''}
                  placeholder="Describe the loyalty program..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Points per Dollar Spent</label>
                <Input
                  name="pointsPerDollar"
                  type="number"
                  step="0.1"
                  defaultValue={selectedProgram?.points_per_dollar || 1}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tier Thresholds (Points Required)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Silver Tier</label>
                    <Input
                      name="silverThreshold"
                      type="number"
                      defaultValue={selectedProgram?.tier_thresholds?.silver || 100}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gold Tier</label>
                    <Input
                      name="goldThreshold"
                      type="number"
                      defaultValue={selectedProgram?.tier_thresholds?.gold || 500}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Platinum Tier</label>
                    <Input
                      name="platinumThreshold"
                      type="number"
                      defaultValue={selectedProgram?.tier_thresholds?.platinum || 1000}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tier Benefits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Bronze Benefits</label>
                    <Textarea
                      name="bronzeBenefits"
                      defaultValue={selectedProgram?.tier_benefits?.bronze || 'Basic rewards'}
                      placeholder="Basic tier benefits..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Silver Benefits</label>
                    <Textarea
                      name="silverBenefits"
                      defaultValue={selectedProgram?.tier_benefits?.silver || '5% discount'}
                      placeholder="Silver tier benefits..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gold Benefits</label>
                    <Textarea
                      name="goldBenefits"
                      defaultValue={selectedProgram?.tier_benefits?.gold || '10% discount + free shipping'}
                      placeholder="Gold tier benefits..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Platinum Benefits</label>
                    <Textarea
                      name="platinumBenefits"
                      defaultValue={selectedProgram?.tier_benefits?.platinum || '15% discount + priority support'}
                      placeholder="Platinum tier benefits..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={programMutation.isPending}>
                  {programMutation.isPending ? 'Saving...' : 'Save Program'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading programs...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {programs?.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    {program.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(program)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(program.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Points per $1:</span>
                    <Badge variant="outline">{program.points_per_dollar}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={program.is_active ? 'default' : 'secondary'}>
                      {program.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Tier Thresholds:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Silver: {program.tier_thresholds?.silver || 100} pts</div>
                      <div>Gold: {program.tier_thresholds?.gold || 500} pts</div>
                      <div>Platinum: {program.tier_thresholds?.platinum || 1000} pts</div>
                    </div>
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

export default LoyaltyPrograms;
