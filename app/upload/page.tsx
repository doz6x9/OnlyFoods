'use client'

import { useState } from 'react'
import { uploadMeal } from './actions'

export default function UploadPage() {
  const [hasRecipe, setHasRecipe] = useState(false)

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">Upload a Meal 📸</h1>

      <form
        action={uploadMeal}
        className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground"
      >
        <label className="text-md font-semibold text-gray-700" htmlFor="image">
          Meal Photo
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          type="file"
          name="image"
          accept="image/*"
          required
        />

        <label className="text-md font-semibold text-gray-700" htmlFor="description">
          Description
        </label>
        <textarea
          className="rounded-md px-4 py-2 bg-inherit border"
          name="description"
          placeholder="What are you eating today?"
          rows={3}
          required
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has_recipe"
            name="has_recipe"
            checked={hasRecipe}
            onChange={(e) => setHasRecipe(e.target.checked)}
            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="has_recipe" className="text-md text-gray-700">
            I have a recipe
          </label>
        </div>

        {hasRecipe && (
          <>
            <label className="text-md font-semibold text-gray-700" htmlFor="recipe_text">
              Recipe
            </label>
            <textarea
              className="rounded-md px-4 py-2 bg-inherit border"
              name="recipe_text"
              placeholder="Share the recipe..."
              rows={6}
            />
          </>
        )}

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 mt-4"
        >
          Upload Meal
        </button>
      </form>
    </div>
  )
}
