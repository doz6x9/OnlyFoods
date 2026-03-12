'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  // 1. Fetch the post to get the image URL and verify ownership
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, user_id, image_url')
    .eq('id', postId)
    .single();

  if (fetchError || !post) {
    return { error: 'Post not found.' };
  }

  if (post.user_id !== user.id) {
    return { error: 'You are not authorized to delete this post.' };
  }

  // 2. Delete the image from Supabase Storage
  // Extract the file path from the public URL.
  // URL format: .../meal-photos/user_id/filename
  // We need the path after 'meal-photos/'
  const urlParts = post.image_url.split('/meal-photos/');
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    const { error: storageError } = await supabase.storage
      .from('meal-photos')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
      // We continue even if storage delete fails, to ensure DB consistency
    }
  }

  // 3. Delete the post from the database
  // This will cascade to comments and recipe_requests if FKs are set correctly
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (deleteError) {
    console.error('Error deleting post:', deleteError);
    return { error: 'Failed to delete the post.' };
  }

  revalidatePath('/');
  revalidatePath(`/profile/${user.id}`);

  return { success: true };
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  if (!content.trim()) {
    return { error: 'Comment cannot be empty.' };
  }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) {
    console.error('Error adding comment:', error);
    return { error: 'Failed to add comment.' };
  }

  revalidatePath(`/post/${postId}`);

  return { success: true };
}

export async function updateRecipe(postId: string, recipeText: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  if (!recipeText.trim()) {
    return { error: 'Recipe text cannot be empty.' };
  }

  // Verify ownership
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (fetchError || !post) {
    return { error: 'Post not found.' };
  }

  if (post.user_id !== user.id) {
    return { error: 'You are not authorized to update this post.' };
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({
      recipe_text: recipeText.trim(),
      has_recipe: true,
    })
    .eq('id', postId);

  if (updateError) {
    console.error('Error updating recipe:', updateError);
    return { error: 'Failed to update recipe.' };
  }

  revalidatePath(`/post/${postId}`);
  return { success: true };
}
