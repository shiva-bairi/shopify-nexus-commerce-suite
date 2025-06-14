
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface KBArticle {
  id?: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_faq?: boolean;
  is_active?: boolean;
}

interface KnowledgeBaseFormProps {
  initial?: Partial<KBArticle>;
  onSubmit: (a: KBArticle) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const KnowledgeBaseForm = ({ initial = {}, onSubmit, loading, onCancel }: KnowledgeBaseFormProps) => {
  const [form, setForm] = useState<KBArticle>({
    title: initial.title || '',
    content: initial.content || '',
    category: initial.category || '',
    tags: initial.tags || [],
    is_faq: Boolean(initial.is_faq),
    is_active: initial.is_active ?? true,
    ...(initial.id ? { id: initial.id } : {}),
  });
  const [tagsString, setTagsString] = useState<string>(form.tags?.join(', ') || '');

  return (
    <form
      className="space-y-3"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ ...form, tags: tagsString ? tagsString.split(',').map(t => t.trim()) : [] });
      }}
    >
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={form.title} required onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" value={tagsString} onChange={e => setTagsString(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={form.content} rows={5} required onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="is_faq"
          checked={!!form.is_faq}
          onCheckedChange={val => setForm(f => ({ ...f, is_faq: val }))}
        />
        <Label htmlFor="is_faq">Mark as FAQ</Label>
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
        <Button type="submit" loading={loading}>{form.id ? 'Save Changes' : 'Create Article'}</Button>
        {onCancel && <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
};

export default KnowledgeBaseForm;
