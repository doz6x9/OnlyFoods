'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';
import { deletePost } from '@/app/actions/postActions';
import Link from 'next/link';
import { Trash2, MessageCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentForm from './CommentForm';

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
    avatar_url: string | null;
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
  const [showCommentBox, setShowCommentBox] = useState(false);

  const authorDisplay = post.profiles?.email?.split('@')[0] || 'Pécs Student';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ y: -5 }}
      className={`break-inside-avoid mb-6 group relative bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Link href={`/post/${post.id}`} className="cursor-pointer block p-2">
        <div className="relative overflow-hidden rounded-2xl">
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            src={post.image_url}
            alt={post.description}
            className="w-full h-auto rounded-2xl block" // Removed object-cover and aspect-ratio
          />
          {canDelete && (
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-white/90 text-red-500 p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                title="Delete Post"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4 pt-2">
        <h3 className="font-nunito font-bold text-lg text-slate-800 leading-tight mb-3 break-words">
          {post.description}
        </h3>

        <div className="flex items-center justify-between gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRequest}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isRequested
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg shadow-md'
            }`}
          >
            <BookOpen size={14} className={isRequested ? 'fill-emerald-700' : ''} />
            {isRequested ? 'Requested' : 'I want the recipe!'}
          </motion.button>
          {requestCount > 0 && (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              +{requestCount}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={authorDisplay}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-[10px] font-bold text-white shadow-sm">
                {authorDisplay.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-xs font-bold text-slate-500 truncate max-w-[100px]">{authorDisplay}</p>
          </div>

          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-colors group/comments"
          >
            <MessageCircle size={16} className="group-hover/comments:fill-emerald-100" />
            <span className="text-xs font-bold">{post.commentCount}</span>
          </button>
        </div>

        <AnimatePresence>
          {showCommentBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <CommentForm postId={post.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-2 text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg text-center">{error}</p>}
      </div>
    </motion.div>
  );
}
