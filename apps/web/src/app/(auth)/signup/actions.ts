'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function createParentProfile(userId: string, fullName: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('parent_profiles')
    .insert([{ user_id: userId, full_name: fullName }]);

  if (error) {
    console.error('Failed to create parent profile:', error.message);
    return { success: false as const };
  }
  return { success: true as const };
}
