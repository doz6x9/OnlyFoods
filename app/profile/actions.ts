'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile picture.' };
  }

  const file = formData.get('avatar') as File | null;

  if (!file || file.size === 0) {
    return { error: 'Please choose an image file.' };
  }

  const filePath = `avatars/${user.id}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('meal-photos')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { error: 'Could not upload your profile picture.' };
  }

  const { data: publicUrlData } = supabase.storage
    .from('meal-photos')
    .getPublicUrl(filePath);

  if (!publicUrlData) {
    return { error: 'Could not get a public URL for your profile picture.' };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile avatar:', updateError);
    return { error: 'Could not update your profile picture.' };
  }

  revalidatePath(`/profile/${user.id}`);
  revalidatePath('/');

  return { success: true };
}

