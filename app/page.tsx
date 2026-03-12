import { createClient } from '@/utils/supabase/server';
import PostCard from './components/PostCard';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      created_at,
      image_url,
      description,
      has_recipe,
      profiles (
        id,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return <p className="text-center text-red-500">Could not fetch posts.</p>;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 px-4 pt-8 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg rotate-12" />
          <h1 className="text-xl font-bold tracking-tight">Pécs Eats</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xl">🔔</button>
          {user ? (
            <Link href={`/profile/${user.id}`} className="w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden">
               <div className="w-full h-full bg-gray-800" />
            </Link>
          ) : (
            <Link href="/login" className="text-gray-700 hover:text-orange-600">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* HORIZONTAL "STORY" LIST (Active Students) */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-b from-orange-500 to-transparent">
              <div className="w-full h-full bg-black rounded-2xl overflow-hidden border-2 border-black">
                <div className="w-full h-full bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4 text-gray-400">Popular in Pécs</h2>

      {/* MAIN FEED CARDS */}
      <div className="grid grid-cols-1 gap-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700">No meals yet!</h2>
            <p className="text-gray-500 mt-2">Be the first to share what you're eating.</p>
            <Link href="/upload" className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
              Upload a Meal
            </Link>
          </div>
        )}
      </div>

      {/* FLOATING TAB BAR */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-full h-16 flex justify-around items-center px-6 z-50">
        <Link href="/" className="text-xl grayscale-0 transition">🏠</Link>
        <Link href="/upload" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black text-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">+</Link>
        {user ? (
          <Link href={`/profile/${user.id}`} className="text-xl grayscale hover:grayscale-0 transition">👤</Link>
        ) : (
          <Link href="/login" className="text-xl grayscale hover:grayscale-0 transition">👤</Link>
        )}
      </nav>
    </div>
  )
}
