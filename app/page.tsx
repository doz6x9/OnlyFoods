import { createClient } from '@/utils/supabase/server';
import PostCard from './components/PostCard';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await (searchParams);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch posts with an explicit join hint for profiles
  let supabaseQuery = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (
        id,
        email
      ),
      recipe_requests (
        user_id
      )
    `)
    .order('created_at', { ascending: false });

  if (query && query !== 'All') {
    supabaseQuery = supabaseQuery.ilike('description', `%${query}%`);
  }

  const { data: postsData, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching posts:', error);
  }

  const posts = postsData?.map(post => {
    const userHasRequested = user
      ? post.recipe_requests.some(req => req.user_id === user.id)
      : false;

    const requestCount = post.recipe_requests.length;

    return {
      ...post,
      user_has_requested: userHasRequested,
      recipe_requests: [{ count: requestCount }]
    };
  }) || [];

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto w-full flex items-center gap-4">
          <Link href="/" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl hover:bg-red-700 transition-colors">
            P
          </Link>
          <div className="flex-1">
            <SearchBar defaultValue={query} />
          </div>
          <div className="flex items-center gap-4 px-2">
            <Link href="/upload" className="font-semibold text-gray-700 hover:text-black hidden sm:block transition-colors">
              Create
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href={`/profile/${user.id}`}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 transition"
                  title="View Profile"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </Link>
                <form action="/auth/signout" method="post" className="hidden sm:block">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>
      <CategoryFilter />
      <main className="max-w-[1800px] mx-auto p-4">
        {posts && posts.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-5 xl:columns-6 gap-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg italic">
              {query ? `No meals found matching "${query}" 🌶️` : "No meals shared yet. Be the first!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
