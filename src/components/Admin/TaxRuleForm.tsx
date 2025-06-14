
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface TaxRule {
  id?: string;
  name: string;
  description?: string;
  rate: number;
  country: string;
  region?: string;
  tax_type: string;
  is_active?: boolean;
}

interface TaxRuleFormProps {
  initial?: Partial<TaxRule>;
  onSubmit: (tax: TaxRule) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const TaxRuleForm = ({ initial = {}, onSubmit, loading, onCancel }: TaxRuleFormProps) => {
  const [form, setForm] = useState<TaxRule>({
    name: initial.name || '',
    description: initial.description || '',
    rate: initial.rate ?? 0,
    country: initial.country || '',
    region: initial.region || '',
    tax_type: initial.tax_type || '',
    is_active: initial.is_active ?? true,
    ...(initial.id ? { id: initial.id } : {}),
  });

  return (
    <form
      className="space-y-3"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Input id="type" value={form.tax_type} required placeholder="VAT, GST, Sales..." onChange={e => setForm(f => ({ ...f, tax_type: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="country">Country (ISO)</Label>
        <Input id="country" value={form.country} required onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="region">Region/State</Label>
        <Input id="region" value={form.region ?? ''} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="rate">Rate (%)</Label>
        <Input id="rate" type="number" min={0} max={100} step={0.01} required value={form.rate} onChange={e => setForm(f => ({ ...f, rate: Number(e.target.value) }))} />
      </div>
      <div>
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={!!form.is_active}
          onCheckedChange={val => setForm(f => ({ ...f, is_active: val }))}
        />
        <Label htmlFor="is_active">{form.is_active ? 'Active' : 'Inactive'}</Label>
      </div>
      <div className="flex gap-2 mt-2">
        <Button type="submit" loading={loading}>{form.id ? 'Save Changes' : 'Create Rule'}</Button>
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
};

export default TaxRuleForm;
