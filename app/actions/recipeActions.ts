'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isValidUuid } from '@/lib/validation';

export async function requestRecipe(postId: string) {
  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to request a recipe.' };
  }

  // Check if request already exists
  const { data: existingRequest, error: checkError } = await supabase
    .from('recipe_requests')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking request status:', checkError);
  }

  if (existingRequest) {
    // Undo request
    const { error: deleteError } = await supabase
      .from('recipe_requests')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing recipe request:', deleteError);
      return { error: 'Failed to undo request.' };
    }
  } else {
    // Create request
    const { error: insertError } = await supabase
      .from('recipe_requests')
      .insert({ post_id: postId, user_id: user.id });

    if (insertError) {
      console.error('Error requesting recipe:', insertError);
      return { error: 'Failed to request recipe.' };
    }
  }

  // Revalidate the path of the post to update the UI
  revalidatePath('/');
  revalidatePath(`/post/${postId}`);
  revalidatePath(`/profile/${user.id}`);

  return { success: true };
}
