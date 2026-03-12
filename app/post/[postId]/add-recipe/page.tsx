import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AddRecipeForm from './AddRecipeForm';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function AddRecipePage({ params }: PageProps) {
  const { postId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch post to verify ownership
  const { data: post, error } = await supabase
    .from('posts')
    .select('user_id, description, image_url, recipe_text')
    .eq('id', postId)
    .single();

  if (error || !post) {
    notFound();
  }

  if (post.user_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">You can only add recipes to your own posts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Add Recipe 📖</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex gap-4 items-start">
        <img
          src={post.image_url}
          alt={post.description}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div>
          <h2 className="font-bold text-slate-800 line-clamp-2">{post.description}</h2>
          <p className="text-sm text-slate-500 mt-1">
            Adding recipe details for this meal.
          </p>
        </div>
      </div>

      <AddRecipeForm postId={postId} initialRecipe={post.recipe_text} />
    </div>
  );
}
