'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function adminDeletePost(postId: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Get image URL first to delete from storage
  const { data: post } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', postId)
    .single();

  if (post?.image_url) {
    const urlParts = post.image_url.split('/meal-photos/');
    if (urlParts.length > 1) {
      await supabase.storage.from('meal-photos').remove([urlParts[1]]);
    }
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { success: true };
}

export async function adminDeleteComment(commentId: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) return { error: error.message };

  revalidatePath('/admin');
  return { success: true };
}
