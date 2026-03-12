import { createClient } from '@/utils/supabase/server';
import PostCard from '@/app/components/PostCard';
import Link from 'next/link';
import AvatarUploadForm from './AvatarUploadForm';
import CoverUploadForm from './CoverUploadForm';
import { ChefHat, Grid, Heart, Settings, UtensilsCrossed } from 'lucide-react';

type ProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (id, email, avatar_url),
      recipe_requests (user_id),
      comments (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (profileError || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="mb-4 text-lg font-medium text-slate-500">User not found.</p>
        <Link href="/" className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all">
          Go Home
        </Link>
      </div>
    );
  }

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  const posts = postsData?.map(post => ({
    ...post,
    user_has_requested: currentUser ? post.recipe_requests.some((req: { user_id: string }) => req.user_id === currentUser.id) : false,
    recipe_requests: [{ count: post.recipe_requests.length }],
    commentCount: post.comments[0]?.count ?? 0,
  })) || [];

  const isOwnProfile = currentUser?.id === userId;
  const displayName = profile.email?.split('@')[0] || 'Foodie';

  return (
    <div className="min-h-screen pb-20">
      {/* Profile Header Card */}
      <div className="relative mb-12 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">

        {/* Banner */}
        <div className="h-48 w-full relative overflow-hidden group bg-slate-100">
          {profile.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            </div>
          )}

          {isOwnProfile && <CoverUploadForm />}
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 mb-8 relative z-10">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="h-32 w-32 rounded-3xl ring-4 ring-white shadow-xl overflow-hidden bg-white flex items-center justify-center relative z-10">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-slate-200 select-none">
                    {profile.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isOwnProfile && <AvatarUploadForm />}
            </div>

            {/* User Info & Stats Container - Pushed down to start BELOW banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6 md:mt-14">
              <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{displayName}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                    {isOwnProfile ? 'Master Chef' : 'Food Explorer'}
                  </span>
                  <span className="text-sm font-mono">{profile.email}</span>
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-center">
                  <span className="block text-2xl font-black text-slate-900">{posts.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posts</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-black text-slate-900">0</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipes</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-black text-slate-900">0</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Likes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-100 pb-1 overflow-x-auto no-scrollbar">
            <button className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-emerald-600 border-b-2 border-emerald-500 transition-colors whitespace-nowrap">
              <Grid size={18} />
              Posts
            </button>
            <button className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">
              <ChefHat size={18} />
              Recipes
            </button>
            <button className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">
              <Heart size={18} />
              Liked
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {posts.length > 0 ? (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-6 space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard
                post={post}
                currentUserId={currentUser?.id ?? null}
                showDeleteButton={isOwnProfile}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <UtensilsCrossed size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No meals shared yet</h3>
          <p className="text-slate-500 max-w-xs text-center mb-6">
            This user hasn't posted any culinary masterpieces yet.
          </p>
          {isOwnProfile && (
            <Link
              href="/upload"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Create First Post
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
