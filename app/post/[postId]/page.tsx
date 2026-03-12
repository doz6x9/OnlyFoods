import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentForm from '@/app/components/CommentForm';
import RequestRecipeButton from '@/app/components/RequestRecipeButton';

type PostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the post with profile info AND recipe requests
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles!posts_user_id_fkey (id, email, avatar_url),
      recipe_requests (user_id)
    `,
    )
    .eq('id', postId)
    .single();

  if (postError || !post) {
    console.error('Error fetching post:', postError);
    notFound();
  }

  // Calculate request stats
  const requestCount = post.recipe_requests.length;
  const userHasRequested = user
    ? post.recipe_requests.some((req: { user_id: string }) => req.user_id === user.id)
    : false;

  // Fetch comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(
      `
      id,
      content,
      created_at,
      profiles (id, email, avatar_url)
    `,
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  const safeComments = commentsError || !comments ? [] : comments;

  const authorDisplay = post.profiles?.email?.split('@')[0] || 'Pécs Student';
  const authorInitial = authorDisplay.charAt(0).toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Image and Recipe */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-slate-100">
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>

        {/* Request Recipe Button (Visible if no recipe text yet) */}
        {!post.has_recipe && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Want the recipe?</h3>
              <p className="text-sm text-slate-500">Let the author know you're interested!</p>
            </div>
            <RequestRecipeButton
              postId={post.id}
              initialRequestCount={requestCount}
              initialUserHasRequested={userHasRequested}
              isLoggedIn={!!user}
            />
          </div>
        )}

        {/* Recipe Section */}
        {post.has_recipe && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
              <span>📖</span> The Recipe
            </h2>
            {post.recipe_text ? (
              <div className="prose prose-orange max-w-none text-slate-700 whitespace-pre-wrap">
                {post.recipe_text}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-orange-600 italic">
                  The author has indicated a recipe is available, but hasn't added the text yet.
                  Request it to encourage them!
                </p>
                <RequestRecipeButton
                  postId={post.id}
                  initialRequestCount={requestCount}
                  initialUserHasRequested={userHasRequested}
                  isLoggedIn={!!user}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Details & Comments */}
      <div className="flex flex-col gap-6 h-fit sticky top-24">
        {/* Author & Description */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={authorDisplay}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg font-bold text-orange-700">
                {authorInitial}
              </div>
            )}
            <div>
              <span className="font-bold text-slate-800 block leading-tight">{authorDisplay}</span>
              <span className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-slate-700 text-lg leading-relaxed">{post.description}</p>
        </div>

        {/* Comments Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-grow min-h-[400px]">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>💬</span> Comments ({safeComments.length})
          </h2>

          <div id="comments" className="flex-grow space-y-4 overflow-y-auto mb-6 max-h-[400px] pr-2 custom-scrollbar">
            {safeComments.length > 0 ? (
              safeComments.map((comment: any) => {
                const commentAuthor = comment.profiles?.email?.split('@')[0] || 'Unknown';
                const commentInitial = commentAuthor.charAt(0).toUpperCase();

                return (
                  <div key={comment.id} className="flex items-start gap-3 group">
                    {comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt={commentAuthor}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0 mt-1"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1 text-slate-500">
                        {commentInitial}
                      </div>
                    )}
                    <div className="flex-grow bg-slate-50 p-3 rounded-xl rounded-tl-none">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{commentAuthor}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p className="italic">No comments yet.</p>
                <p className="text-xs mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          <div className="mt-auto">
            {!user && (
              <p className="text-xs text-center text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">
                <Link href="/login" className="text-red-600 font-bold hover:underline">
                  Log in
                </Link>{' '}
                to join the conversation.
              </p>
            )}
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
