'use client';

import { useState } from 'react';
import { requestRecipe } from '@/app/actions/recipeActions';

interface RequestRecipeButtonProps {
  postId: string;
  initialRequestCount: number;
  initialUserHasRequested: boolean;
  isLoggedIn: boolean;
}

export default function RequestRecipeButton({
  postId,
  initialRequestCount,
  initialUserHasRequested,
  isLoggedIn,
}: RequestRecipeButtonProps) {
  const [isRequested, setIsRequested] = useState(initialUserHasRequested);
  const [requestCount, setRequestCount] = useState(initialRequestCount);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    const alreadyRequested = isRequested;
    // Optimistic update
    setIsRequested(!alreadyRequested);
    setRequestCount((prev) => (alreadyRequested ? prev - 1 : prev + 1));
    setError(null);

    const result = await requestRecipe(postId);
    if (result.error) {
      setError(result.error);
      // Revert on error
      setIsRequested(alreadyRequested);
      setRequestCount((prev) => (alreadyRequested ? prev + 1 : prev - 1));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <button
          onClick={handleRequest}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${
            isRequested
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
          }`}
        >
          <span>{isRequested ? '✓ Recipe Requested' : 'Request Recipe'}</span>
        </button>
        <div className="text-slate-500 font-medium text-sm">
          {requestCount} requests
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
