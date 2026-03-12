'use client';

import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';

interface Post {
  id: string;
  image_url: string;
  description: string;
  has_recipe: boolean;
  profiles: {
    id: string;
    email: string;
  } | null;
  recipe_requests: { count: number }[];
  user_has_requested: boolean;
}

export default function PostCard({ post }: { post: Post }) {
  const [isRequested, setIsRequested] = useState(post.user_has_requested);
  const [requestCount, setRequestCount] = useState(post.recipe_requests[0]?.count ?? 0);
  const [error, setError] = useState<string | null>(null);

  const authorDisplay = post.profiles?.email.split('@')[0] || 'Pécs Student';

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Optimistically update the UI
    if (isRequested) {
      setIsRequested(false);
      setRequestCount(prev => prev - 1);
    } else {
      setIsRequested(true);
      setRequestCount(prev => prev + 1);
    }

    const result = await requestRecipe(post.id);

    if (result.error) {
      setError(result.error);
      // Revert UI on error
      setIsRequested(prev => !prev);
      setRequestCount(prev => isRequested ? prev + 1 : prev - 1);
    } else {
      setError(null);
    }
  };

  return (
    <div className="break-inside-avoid mb-4 group relative cursor-pointer">
      <div className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <img
          src={post.image_url}
          alt={post.description}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
        />
      </div>

      <div className="mt-2 px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
            {post.description}
          </h3>
          <button
            onClick={handleRequest}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors p-1 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`w-5 h-5 transition-all ${isRequested ? 'fill-red-600' : 'fill-current'}`}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm font-semibold">{requestCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-[10px] font-bold text-orange-700">
            {authorDisplay.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs text-gray-500 font-medium">{authorDisplay}</p>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
