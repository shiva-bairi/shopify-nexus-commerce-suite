
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a given user has a specific role.
 */
export async function userHasRole(user_id: string, role: 'admin' | 'moderator' | 'user') {
  const { data, error } = await supabase
    .rpc('has_role', {
      _user_id: user_id,
      _role: role,
    });

  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }
  return !!data;
}

/**
 * Assign a role to a user.
 * WARNING: Only call this from a trusted (admin) context.
 */
export async function assignRole(user_id: string, role: 'admin' | 'moderator' | 'user') {
  // Upsert to handle cases where the user already has this role.
  const { data, error } = await supabase
    .from('user_roles')
    .upsert([{ user_id, role }], { onConflict: ['user_id', 'role'] });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Remove a role from a user.
 */
export async function removeRole(user_id: string, role: 'admin' | 'moderator' | 'user') {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', user_id)
    .eq('role', role);
  if (error) {
    throw error;
  }
}

/**
 * List all roles for a user.
 */
export async function listUserRoles(user_id: string): Promise<('admin' | 'moderator' | 'user')[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: { role: string }) => row.role as 'admin' | 'moderator' | 'user');
}
