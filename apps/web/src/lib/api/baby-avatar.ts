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

const MAX_UPLOAD_DIMENSION = 1200;
const OPTIMIZE_AFTER_BYTES = 0;

async function optimizeAvatar(file: File): Promise<File> {
  if (file.size <= OPTIMIZE_AFTER_BYTES) {
    return file;
  }

  if (typeof createImageBitmap === 'undefined') {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const longestSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_UPLOAD_DIMENSION / longestSide);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const compressed = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82),
  );

  if (!compressed || compressed.size >= file.size) {
    return file;
  }

  return new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export interface BabyAvatarUploadResult {
  avatarPath: string;
  avatarUrl: string;
}

export async function uploadBabyAvatar(
  babyId: string,
  file: File,
): Promise<BabyAvatarUploadResult> {
  const originalExtension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!originalExtension) {
    throw new Error('Please select a JPEG, PNG, or WebP image.');
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('The photo must be 5 MB or smaller.');
  }

  const uploadFile = await optimizeAvatar(file);
  const extension = ALLOWED_IMAGE_TYPES.get(uploadFile.type) ?? originalExtension;

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
    .upload(avatarPath, uploadFile, {
      cacheControl: '3600',
      contentType: uploadFile.type,
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
    void supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .remove([baby.avatar_path])
      .then(({ error: cleanupError }) => {
        if (cleanupError) {
          console.error(
            '[uploadBabyAvatar] Unable to remove previous avatar:',
            cleanupError,
          );
        }
      });
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
