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

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, user_id')
    .eq('id', postId)
    .single();

  if (fetchError || !post) {
    console.error('Error fetching post before delete:', fetchError);
    return { error: 'Post not found.' };
  }

  if (post.user_id !== user.id) {
    return { error: 'You can only delete your own posts.' };
  }

  // Best-effort cleanup of related data in case foreign keys
  // are not set to CASCADE.
  const { error: commentsError } = await supabase
    .from('comments')
    .delete()
    .eq('post_id', postId);

  if (commentsError) {
    console.error('Error deleting comments for post:', commentsError);
  }

  const { error: requestsError } = await supabase
    .from('recipe_requests')
    .delete()
    .eq('post_id', postId);

  if (requestsError) {
    console.error('Error deleting recipe requests for post:', requestsError);
  }

  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (deleteError) {
    console.error('Error deleting post:', deleteError);
    return { error: 'Failed to delete post.' };
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
