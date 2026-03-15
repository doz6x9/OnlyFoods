'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';
import { deletePost } from '@/app/actions/postActions';
import Link from 'next/link';
import { Trash2, MessageCircle, BookOpen, Flame, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentForm from './CommentForm';
import LikeButton from './LikeButton';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  has_recipe: boolean;
  created_at: string;
  spice_level?: number;
  dietary_badges?: string[];
  profiles: {
    id: string;
    email: string;
    avatar_url: string | null;
  } | null;
  recipe_requests: { count: number }[];
  user_has_requested: boolean;
  commentCount: number;
  likeCount: number;
  user_has_liked: boolean;
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
    if (!currentUserId || currentUserId !== post.user_id) return;
    if (!window.confirm('Delete this post?')) return;
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
      setError('Something went wrong.');
      setIsDeleting(false);
    }
  };

  const canDelete = showDeleteButton && currentUserId === post.user_id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`break-inside-avoid group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="relative overflow-hidden bg-slate-50">
        <Link href={`/post/${post.id}`} className="block">
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
          />
        </Link>

        {/* Top Overlay: Avatar (Always Visible) & Delete (Hover) */}
        <div className="absolute top-0 inset-x-0 p-3 flex justify-between items-start z-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
          {/* Avatar Top Left - ALWAYS VISIBLE */}
          <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2 pointer-events-auto hover:opacity-80 transition-opacity">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white ring-1 ring-white/50 shadow-sm">
                {authorDisplay.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-white drop-shadow-md truncate max-w-[120px]">{authorDisplay}</span>
          </Link>

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 pointer-events-auto"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Badges Overlay (Below Avatar) */}
        <div className="absolute top-14 left-3 flex flex-col gap-1 pointer-events-none z-10">
          {post.spice_level && post.spice_level > 0 ? (
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm w-fit">
              <Flame size={12} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-bold text-orange-600">{post.spice_level}</span>
            </div>
          ) : null}
          {post.dietary_badges?.slice(0, 2).map((badge) => (
            <div key={badge} className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm w-fit">
              <Leaf size={10} className="text-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide">{badge.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Bottom Actions Overlay (Request on Left, Comment on Right) */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none">

          {/* Left Side: Recipe Request Button */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={handleRequest}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                isRequested
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
              }`}
            >
              <BookOpen size={14} className={isRequested ? 'fill-white' : ''} />
              {isRequested ? 'Requested' : 'Recipe'}
            </button>
          </div>

          {/* Right Side: Comment Button Overlay */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowCommentBox(!showCommentBox);
              }}
              className="flex flex-col items-center gap-1 group/comments"
              title="Comments"
            >
              <div className="p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all bg-white/80 text-slate-700 hover:bg-white">
                <MessageCircle size={20} className="group-hover/comments:text-emerald-600 transition-colors" />
              </div>
              {post.commentCount > 0 && (
                <span className="text-[11px] font-bold text-white drop-shadow-md">
                  {post.commentCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Post Content Below Image */}
      <div className="p-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link href={`/post/${post.id}`} className="block">
              <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                {post.description}
              </h3>
            </Link>
            {requestCount > 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{requestCount} want this recipe</p>
            )}
          </div>

          <div className="mt-0.5 flex-shrink-0">
            {/* Like Button (Heart is now much bigger) */}
            <LikeButton
              postId={post.id}
              initialLiked={post.user_has_liked}
              initialCount={post.likeCount}
              currentUserId={currentUserId}
              variant="compact"
            />
          </div>
        </div>

        <AnimatePresence>
          {showCommentBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-slate-100"
            >
              <div className="bg-slate-50/80 rounded-xl p-2 border border-slate-100">
                <CommentForm postId={post.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    </motion.article>
  );
}
