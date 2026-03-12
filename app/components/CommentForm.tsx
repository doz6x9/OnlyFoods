'use client';

import { useState, useTransition } from 'react';
import { addComment } from '@/app/actions/postActions';

export default function CommentForm({ postId }: { postId: string }) {
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addComment(postId, comment);
      if (result?.error) {
        setError(result.error);
      } else {
        setComment(''); // Clear input on success
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 w-full">
      <textarea
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-grow bg-slate-100 border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
        rows={1}
        required
      />
      <button
        type="submit"
        disabled={isPending || !comment.trim()}
        className="bg-red-600 text-white font-bold text-xs px-3 py-2 rounded-lg transition hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        {isPending ? '...' : 'Post'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1 w-full">{error}</p>}
    </form>
  );
}
