'use client';

import { useState, useTransition } from 'react';
import { updateRecipe } from '@/app/actions/postActions';
import { useRouter } from 'next/navigation';

export default function AddRecipeForm({ postId, initialRecipe }: { postId: string, initialRecipe?: string | null }) {
  const [recipe, setRecipe] = useState(initialRecipe || '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateRecipe(postId, recipe);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/post/${postId}`); // Redirect back to the post
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="recipe" className="block text-sm font-medium text-slate-700 mb-2">
          Recipe Instructions
        </label>
        <textarea
          id="recipe"
          rows={10}
          className="w-full rounded-lg border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          placeholder="Share ingredients and steps..."
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
}
