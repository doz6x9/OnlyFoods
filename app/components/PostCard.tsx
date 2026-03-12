'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';
import { deletePost } from '@/app/actions/postActions';
import Link from 'next/link';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  has_recipe: boolean;
  created_at: string;
  profiles: {
    id: string;
    email: string;
  } | null;
  recipe_requests: { count: number }[];
  user_has_requested: boolean;
  commentCount: number;
}

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  showDeleteButton?: boolean;
}

export default function PostCard({ post, currentUserId, showDeleteButton = false }: PostCardProps) {
  const router = useRouter();
  const [isRequested, setIsRequested] = useState(post.user_has_requested);
  const [requestCount, setRequestCount] = useState(post.recipe_requests[0]?.count ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorDisplay = post.profiles?.email.split('@')[0] || 'Pécs Student';

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      window.location.href = '/login';
      return;
    }

    const alreadyRequested = isRequested;
    setIsRequested(!alreadyRequested);
    setRequestCount((prev) => (alreadyRequested ? prev - 1 : prev + 1));
    setError(null);

    const result = await requestRecipe(post.id);
    if (result.error) {
      setError(result.error);
      setIsRequested(alreadyRequested);
      setRequestCount((prev) => (alreadyRequested ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId || currentUserId !== post.user_id) {
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      const result = await deletePost(post.id);
      if (result?.error) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Something went wrong while deleting the post.');
      setIsDeleting(false);
    }
  };

  const canDelete = showDeleteButton && currentUserId === post.user_id;

  return (
    <div
      className={`break-inside-avoid mb-4 group relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Link href={`/post/${post.id}`} className="cursor-pointer block">
        <div className="relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-xl">
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {canDelete && (
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2 px-1 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-slate-950 transition-colors">
          {post.description}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleRequest}
            className={`flex-grow px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all ${
              isRequested ? 'bg-slate-200 text-slate-600' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isRequested ? '✓ Requested' : 'Request Recipe'}
          </button>
          <div className="text-sm font-bold text-slate-600 pr-2">{requestCount}</div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
              {authorDisplay.charAt(0).toUpperCase()}
            </div>
            <p className="font-medium">{authorDisplay}</p>
          </div>
          <Link href={`/post/${post.id}#comments`} className="hover:underline">
            {post.commentCount} comments
          </Link>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
