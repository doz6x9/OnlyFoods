import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/'); // Kick non-admins out
  }

  // Fetch all posts with explicit hint
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(email)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (postsError) {
    console.error("Admin posts error:", postsError);
  }

  // Fetch all comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (commentsError) {
    console.error("Admin comments error:", commentsError);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard 🛡️</h1>
      <AdminDashboard posts={posts || []} comments={comments || []} />
    </div>
  );
}
