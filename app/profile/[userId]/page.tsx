import { createClient } from '@/utils/supabase/server';
import PostCard from '@/app/components/PostCard';
import Link from 'next/link';
import { updateAvatar } from '../actions';

type ProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles!posts_user_id_fkey (id, email),
      recipe_requests (user_id),
      comments (count)
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="mb-4 text-sm text-red-500">Could not load this profile.</p>
        <Link href="/" className="text-sm font-semibold text-red-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  const posts =
    postsData?.map((post) => ({
      ...post,
      user_has_requested: currentUser
        ? post.recipe_requests.some((req: { user_id: string }) => req.user_id === currentUser.id)
        : false,
      recipe_requests: [{ count: post.recipe_requests.length }],
      commentCount: post.comments[0]?.count ?? 0,
    })) || [];

  const isOwnProfile = currentUser?.id === userId;
  const displayName = profile.email?.split('@')[0] || 'Pécs Student';

  return (
    <div>
      <div className="mb-12 flex flex-col items-center">
        <div className="relative mb-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-32 w-32 rounded-full border border-slate-200 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-4xl font-bold text-slate-400 shadow-sm">
              {profile.email?.charAt(0).toUpperCase()}
            </div>
          )}

          {isOwnProfile && (
            <form
              action={updateAvatar}
              className="absolute -right-2 -bottom-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm"
            >
              <label className="cursor-pointer">
                <span className="mr-1">Change</span>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-600"
              >
                Save
              </button>
            </form>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
        <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
        <p className="mt-2 text-sm font-medium text-slate-500">{posts.length || 0} meals shared</p>
      </div>

      <hr className="mb-8 border-slate-200" />

      {posts.length > 0 ? (
        <div className="columns-2 gap-4 space-y-4 sm:columns-3 md:columns-4 lg:columns-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group break-inside-avoid rounded-2xl transition-transform duration-200 hover:-translate-y-1"
            >
              <PostCard
                post={post}
                currentUserId={currentUser?.id ?? null}
                showDeleteButton={isOwnProfile}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-slate-500 italic">
          This user hasn&apos;t shared any meals yet.
        </p>
      )}
    </div>
  );
}
