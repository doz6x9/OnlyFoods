import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient();
  const { userId } = params;

  // Fetch profile information
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Fetch user's posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, image_url, description')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (profileError || !profile) {
    return <p className="text-center text-red-500">Could not load profile.</p>;
  }

  if (postsError) {
    return <p className="text-center text-red-500">Could not load posts.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">🍽️ Pécs Eats</Link>
          <Link href="/upload" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
            Upload
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-300 mb-4"></div>
          <h1 className="text-2xl font-bold">{profile.email}</h1>
          {/* Add more profile details here if available */}
        </div>

        <hr className="mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="relative aspect-square">
                <Image
                  src={post.image_url}
                  alt={post.description}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">This user hasn't posted any meals yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
