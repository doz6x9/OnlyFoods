'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const image = formData.get('avatar') as File;

  if (!image || image.size === 0) {
    return { error: 'No image selected.' };
  }

  if (image.size > 2 * 1024 * 1024) {
    return { error: 'Image size must be less than 2MB.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(image.type)) {
    return { error: 'Only JPG, PNG and WEBP images are allowed.' };
  }

  const fileExt = image.name.split('.').pop();
  const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, image);

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { error: 'Failed to upload avatar image.' };
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return { error: 'Failed to update profile database.' };
  }

  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}

export async function uploadCover(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const image = formData.get('cover') as File;

  if (!image || image.size === 0) {
    return { error: 'No image selected.' };
  }

  // Allow slightly larger size for covers (e.g., 4MB)
  if (image.size > 4 * 1024 * 1024) {
    return { error: 'Image size must be less than 4MB.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(image.type)) {
    return { error: 'Only JPG, PNG and WEBP images are allowed.' };
  }

  const fileExt = image.name.split('.').pop();
  // Store in a 'covers' folder within the user's directory if you want,
  // or just name it differently. Let's use prefix.
  const filePath = `${user.id}/cover_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars') // Reusing the avatars bucket which has public access
    .upload(filePath, image);

  if (uploadError) {
    console.error('Error uploading cover:', uploadError);
    return { error: 'Failed to upload cover image.' };
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ cover_url: publicUrlData.publicUrl })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return { error: 'Failed to update profile database.' };
  }

  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}
