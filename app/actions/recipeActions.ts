'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestRecipe(postId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to request a recipe.' };
  }

  // Attempt to insert the request.
  // The database's primary key will prevent duplicates.
  const { error } = await supabase.from('recipe_requests').insert({
    post_id: postId,
    user_id: user.id,
  });

  if (error) {
    // Check if the error is because of a duplicate key violation
    if (error.code === '23505') { // Unique violation
      return { error: 'You have already requested this recipe.' };
    }
    console.error('Error requesting recipe:', error);
    return { error: 'An unexpected error occurred.' };
  }

  // Revalidate the path of the post to update the UI
  revalidatePath('/');
  revalidatePath(`/profile/${user.id}`); // Also revalidate profile pages

  return { success: true };
}
