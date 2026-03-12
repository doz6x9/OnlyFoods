import { createClient } from '@/utils/supabase/server';
import PostCard from './components/PostCard';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await (searchParams);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let supabaseQuery = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (id, email, avatar_url),
      recipe_requests (user_id),
      comments (count)
    `)
    .order('created_at', { ascending: false });

  if (query && query !== 'All') {
    supabaseQuery = supabaseQuery.ilike('description', `%${query}%`);
  }

  const { data: postsData, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching posts:', error);
  }

  const posts = postsData?.map(post => ({
    ...post,
    user_has_requested: user ? post.recipe_requests.some(req => req.user_id === user.id) : false,
    recipe_requests: [{ count: post.recipe_requests.length }],
    commentCount: post.comments[0]?.count ?? 0,
  })) || [];

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto space-y-4 mb-8">
        <SearchBar defaultValue={query} />
        <CategoryFilter />
      </div>

      {posts.length > 0 ? (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard post={post} currentUserId={user?.id ?? null} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg italic">
            {query ? `No results for "${query}". Try another search!` : "No meals have been shared yet. Be the first!"}
          </p>
        </div>
      )}
    </div>
  );
}
