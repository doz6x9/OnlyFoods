'use client';

import { useTransition } from 'react';
import { adminDeletePost, adminDeleteComment } from '@/app/actions/adminActions';
import { Trash2 } from 'lucide-react';

export default function AdminDashboard({ posts, comments }: { posts: any[], comments: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      startTransition(() => adminDeletePost(postId));
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      startTransition(() => adminDeleteComment(commentId));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Posts Column */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Posts</h2>
        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-start gap-3">
                <img src={post.image_url} alt="" className="w-12 h-12 object-cover rounded-md" />
                <div>
                  <p className="text-sm text-slate-700 line-clamp-2">{post.description}</p>
                  <p className="text-xs text-slate-500 mt-1">by {post.profiles?.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeletePost(post.id)}
                disabled={isPending}
                className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Column */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Comments</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <p className="text-sm text-slate-800">"{comment.content}"</p>
                <p className="text-xs text-slate-500 mt-1">by {comment.profiles?.email}</p>
              </div>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                disabled={isPending}
                className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
