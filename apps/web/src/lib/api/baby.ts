import { calculateBabyAge } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import { validateBabyInput } from '@/lib/validation/baby';

const BABY_AVATARS_BUCKET = 'baby-avatars';
const AVATAR_SIGNED_URL_TTL_SECONDS = 60 * 60;

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
  avatarUrl: string | null;
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
  avatarUrl: string | null;
}): BabyProfile {
  const age = calculateBabyAge(baby.birth_date, { dueDate: baby.due_date });

  return {
    id: baby.id,
    name: baby.name,
    birthDate: baby.birth_date,
    dueDate: baby.due_date ?? null,
    ageMonths: age.ageMonths,
    ageLabel: age.ageLabel,
    avatarUrl: baby.avatarUrl,
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
    .select('id, name, birth_date, due_date, avatar_path');

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

  let avatarUrl: string | null = null;
  if (baby.avatar_path) {
    const { data: signedAvatar, error: avatarError } = await supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .createSignedUrl(baby.avatar_path, AVATAR_SIGNED_URL_TTL_SECONDS);

    if (!avatarError) {
      avatarUrl = signedAvatar.signedUrl;
    }
  }

  return toBabyProfile({ ...baby, avatarUrl });
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
    .select('id, name, birth_date, due_date, avatar_path')
    .single();

  if (error) {
    console.error('[createBaby] Database error:', error);
    throw new Error(`Database error creating baby: ${error.message}`);
  }

  return toBabyProfile({ ...baby, avatarUrl: null });
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
    .select('id, name, birth_date, due_date, avatar_path')
    .single();

  if (error) {
    console.error('[updateBaby] Database error:', error);
    throw new Error(`Database error updating baby: ${error.message}`);
  }

  let avatarUrl: string | null = null;
  if (baby.avatar_path) {
    const { data: signedAvatar, error: avatarError } = await supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .createSignedUrl(baby.avatar_path, AVATAR_SIGNED_URL_TTL_SECONDS);

    if (!avatarError) {
      avatarUrl = signedAvatar.signedUrl;
    }
  }

  return toBabyProfile({ ...baby, avatarUrl });
}
