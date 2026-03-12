import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

type ProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  // Fetch profile information
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Fetch user's posts along with the count of recipe requests
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      description,
      recipe_requests (
        count
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        <p className="text-red-500 mb-4">Could not load profile.</p>
        <Link href="/" className="text-blue-500 underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="max-w-[1800px] mx-auto w-full flex items-center gap-4">
          <Link href="/" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            P
          </Link>
          <div className="flex-1 font-bold text-lg">
            {profile.email?.split('@')[0]}'s Profile
          </div>
          <Link href="/upload" className="bg-gray-100 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">
            Create
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto py-12 px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 mb-4 border border-gray-100 shadow-sm">
            {profile.email?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold">{profile.email}</h1>
          <p className="text-gray-500 mt-2 font-medium">{posts?.length || 0} meals shared</p>
        </div>

        <hr className="border-gray-100 mb-12" />

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={post.image_url}
                  alt={post.description}
                  className="w-full h-auto object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <p className="text-white text-xs font-medium truncate">{post.description}</p>
                  <div className="text-white text-sm font-bold self-end">
                    {post.recipe_requests[0]?.count ?? 0} Requests
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 italic py-20">
              No meals shared yet. 🥘
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
