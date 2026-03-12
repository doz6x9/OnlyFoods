import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentForm from './CommentForm';

type PostPageProps = {
  params: {
    postId: string;
  };
};

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles (id, email)
    `,
    )
    .eq('id', postId)
    .single();

  if (postError || !post) {
    notFound();
  }

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(
      `
      id,
      content,
      created_at,
      profiles (id, email)
    `,
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  const safeComments = commentsError || !comments ? [] : comments;

  const authorDisplay = post.profiles?.email.split('@')[0] || 'Pécs Student';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg font-bold text-orange-700">
              {authorDisplay.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-800">{authorDisplay}</span>
          </div>
          <p className="text-slate-700">{post.description}</p>
        </div>

        <hr className="border-slate-200" />

        <div id="comments" className="flex-grow space-y-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-800">Comments</h2>
          {safeComments.length > 0 ? (
            safeComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {comment.profiles?.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <p className="text-sm">
                    <span className="font-bold mr-2">{comment.profiles?.email.split('@')[0]}</span>
                    {comment.content}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No comments yet.</p>
          )}
        </div>

        <div className="space-y-2">
          {!user && (
            <p className="text-xs text-center text-slate-500">
              You&apos;ll need to{' '}
              <Link href="/login" className="text-red-600 font-semibold hover:underline">
                log in
              </Link>{' '}
              for your comment to be posted.
            </p>
          )}
          <CommentForm postId={post.id} />
        </div>
      </div>
    </div>
  );
}
