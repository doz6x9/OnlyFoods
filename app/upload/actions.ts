'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadMeal(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login?message=You must be logged in to upload a meal.')
  }

  // 1. Check daily post limit (3 posts per day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { count, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())

  if (countError) {
    console.error('Error checking post count:', countError)
    return redirect('/upload?message=Could not verify your post count.')
  }

  if (count !== null && count >= 3) {
    return redirect('/upload?message=You have reached your daily post limit of 3 meals.')
  }

  // 2. Get form data
  const image = formData.get('image') as File
  const description = formData.get('description') as string
  const has_recipe = formData.get('has_recipe') === 'on'
  const recipe_text = formData.get('recipe_text') as string | null

  if (!image || image.size === 0) {
    return redirect('/upload?message=Please select an image to upload.')
  }

  // 3. Upload image to storage
  const imagePath = `${user.id}/${Date.now()}_${image.name}`
  const { error: uploadError } = await supabase.storage
    .from('meal-photos')
    .upload(imagePath, image)

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    return redirect('/upload?message=Could not upload your image. Please try again.')
  }

  // 4. Get public URL for the uploaded image
  const { data: publicUrlData } = supabase.storage
    .from('meal-photos')
    .getPublicUrl(imagePath)

  if (!publicUrlData) {
    return redirect('/upload?message=Could not get the public URL for the image.')
  }

  // 5. Insert post into the database
  const { error: dbError } = await supabase.from('posts').insert({
    user_id: user.id,
    image_url: publicUrlData.publicUrl,
    description,
    has_recipe,
    recipe_text: has_recipe ? recipe_text : null,
  })

  if (dbError) {
    console.error('Error inserting post:', dbError)
    // Clean up the uploaded image if the DB insert fails
    await supabase.storage.from('meal-photos').remove([imagePath])
    return redirect('/upload?message=Could not save your meal. Please try again.')
  }

  // 6. On success, revalidate the home page and redirect
  revalidatePath('/')
  redirect('/')
}
