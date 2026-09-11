import { calculateBabyAge } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import { validateBabyInput } from '@/lib/validation/baby';

export interface BabyInput {
  name: string;
  birthDate: string;
  dueDate?: string | null;
}

export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  dueDate: string | null;
  ageMonths: number;
  ageLabel: string;
}

async function getParentId(
  supabase: Awaited<ReturnType<typeof createServerClient>>
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: profile, error } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('[baby] Database error fetching parent profile:', error);
    throw new Error(
      `Database error fetching parent profile: ${error.message}`
    );
  }

  return profile.id;
}

function toBabyProfile(baby: {
  id: string;
  name: string;
  birth_date: string;
  due_date: string | null;
}): BabyProfile {
  const age = calculateBabyAge(baby.birth_date, { dueDate: baby.due_date });

  return {
    id: baby.id,
    name: baby.name,
    birthDate: baby.birth_date,
    dueDate: baby.due_date ?? null,
    ageMonths: age.ageMonths,
    ageLabel: age.ageLabel,
  };
}

export async function getBaby(babyId?: string): Promise<BabyProfile | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  let query = supabase
    .from('babies')
    .select('id, name, birth_date, due_date');

  if (babyId) {
    query = query.eq('id', babyId);
  }

  const { data: baby, error } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getBaby] Database error:', error);
    throw new Error(`Database error fetching baby: ${error.message}`);
  }

  if (!baby) {
    return null;
  }

  return toBabyProfile(baby);
}

export async function createBaby(input: BabyInput): Promise<BabyProfile> {
  const supabase = await createServerClient();
  const parentId = await getParentId(supabase);
  const validated = validateBabyInput(input);

  const { data: baby, error } = await supabase
    .from('babies')
    .insert({
      parent_id: parentId,
      name: validated.name,
      birth_date: validated.birthDate,
      due_date: validated.dueDate,
    })
    .select('id, name, birth_date, due_date')
    .single();

  if (error) {
    console.error('[createBaby] Database error:', error);
    throw new Error(`Database error creating baby: ${error.message}`);
  }

  return toBabyProfile(baby);
}

export async function updateBaby(
  babyId: string,
  input: BabyInput
): Promise<BabyProfile> {
  const supabase = await createServerClient();

  const parentId = await getParentId(supabase);
  const validated = validateBabyInput(input);

  const { data: baby, error } = await supabase
    .from('babies')
    .update({
      name: validated.name,
      birth_date: validated.birthDate,
      due_date: validated.dueDate,
    })
    .eq('id', babyId)
    .eq('parent_id', parentId)
    .select('id, name, birth_date, due_date')
    .single();

  if (error) {
    console.error('[updateBaby] Database error:', error);
    throw new Error(`Database error updating baby: ${error.message}`);
  }

  return toBabyProfile(baby);
}
