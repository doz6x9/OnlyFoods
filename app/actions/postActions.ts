'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isValidUuid, LIMITS } from '@/lib/validation';

export async function deletePost(postId: string) {
  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
  }

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

  const trimmed = content.trim();
  if (!trimmed) {
    return { error: 'Comment cannot be empty.' };
  }
  if (trimmed.length > LIMITS.COMMENT_CONTENT) {
    return { error: `Comment must be ${LIMITS.COMMENT_CONTENT} characters or less.` };
  }

  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
  }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: trimmed.slice(0, LIMITS.COMMENT_CONTENT),
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

  const trimmed = recipeText.trim();
  if (!trimmed) {
    return { error: 'Recipe text cannot be empty.' };
  }
  if (trimmed.length > LIMITS.RECIPE_TEXT) {
    return { error: `Recipe must be ${LIMITS.RECIPE_TEXT.toLocaleString()} characters or less.` };
  }

  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
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
      recipe_text: trimmed.slice(0, LIMITS.RECIPE_TEXT),
      has_recipe: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (updateError) {
    console.error('Error updating recipe:', updateError);
    return {
      error: updateError.code === '42501'
        ? 'You don’t have permission to update this post. In Supabase, add an RLS policy so post owners can update their posts.'
        : 'Failed to save recipe. Please try again.',
    };
  }

  // Revalidate so owner and requesters see the updated description page with recipe
  revalidatePath(`/post/${postId}`);
  revalidatePath('/');
  return { success: true };
}

export async function toggleLike(postId: string) {
  if (!postId || !isValidUuid(postId)) {
    return { error: 'Invalid post.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  // Check if the like already exists
  const { data: existingLike, error: checkError } = await supabase
    .from('likes')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    // Ignore "Row not found" error, log others
    console.error('Error checking like status:', checkError);
  }

  if (existingLike) {
    // Remove like
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) return { error: 'Failed to unlike post.' };
  } else {
    // Add like
    const { error: insertError } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id });

    if (insertError) return { error: 'Failed to like post.' };
  }

  revalidatePath('/');
  revalidatePath(`/post/${postId}`);

  return { success: true };
}
