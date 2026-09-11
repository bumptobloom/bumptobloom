'use client';

import { createBrowserClient } from '../supabase/client';

const BABY_AVATARS_BUCKET = 'baby-avatars';
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export interface BabyAvatarUploadResult {
  avatarPath: string;
  avatarUrl: string;
}

export async function uploadBabyAvatar(
  babyId: string,
  file: File,
): Promise<BabyAvatarUploadResult> {
  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    throw new Error('Please select a JPEG, PNG, or WebP image.');
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('The photo must be 5 MB or smaller.');
  }

  const supabase = createBrowserClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be signed in to upload a baby photo.');
  }

  const { data: baby, error: babyError } = await supabase
    .from('babies')
    .select('id, avatar_path')
    .eq('id', babyId)
    .single();

  if (babyError || !baby) {
    throw new Error('Baby profile not found or access was denied.');
  }

  const avatarPath =
    `${user.id}/${babyId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BABY_AVATARS_BUCKET)
    .upload(avatarPath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Photo upload failed: ${uploadError.message}`);
  }

  const { error: updateError } = await supabase
    .from('babies')
    .update({ avatar_path: avatarPath })
    .eq('id', babyId);

  if (updateError) {
    await supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .remove([avatarPath]);

    throw new Error(`Unable to save the photo: ${updateError.message}`);
  }

  if (baby.avatar_path && baby.avatar_path !== avatarPath) {
    const { error: cleanupError } = await supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .remove([baby.avatar_path]);

    if (cleanupError) {
      console.error(
        '[uploadBabyAvatar] Unable to remove previous avatar:',
        cleanupError,
      );
    }
  }

  const { data: signedAvatar, error: signedUrlError } =
    await supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .createSignedUrl(avatarPath, SIGNED_URL_TTL_SECONDS);

  if (signedUrlError) {
    throw new Error(
      `Photo saved, but its preview could not be created: ${signedUrlError.message}`,
    );
  }

  return {
    avatarPath,
    avatarUrl: signedAvatar.signedUrl,
  };
}