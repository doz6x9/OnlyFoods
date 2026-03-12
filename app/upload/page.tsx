'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { uploadMeal } from './actions'
import { UploadCloud, Camera, FileText, Tag, Utensils, X, ChefHat } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Healthy', 'Pécs Specials'];

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-lg"
    >
      {pending ? (
        'Uploading...'
      ) : (
        <>
          <UploadCloud size={22} />
          <span>Share Your Meal</span>
        </>
      )}
    </button>
  )
}

export default function UploadPage() {
  const [hasRecipe, setHasRecipe] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    // Reset file input value if needed via ref, but state reset is visual enough for now
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">

        {/* Left Side: Preview / Upload Zone */}
        <div className="md:w-1/2 bg-slate-50 p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100 relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-lg group"
              >
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={clearPreview}
                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all transform hover:scale-110"
                  >
                    <X size={24} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer relative"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-emerald-500">
                  <Camera size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Photo</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Drag and drop or click to browse. Show us what's cooking!
                </p>
                <input
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Form Details */}
        <div className="md:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Food Details</h1>
            <p className="text-slate-500 font-medium">Tell us about this deliciousness.</p>
          </div>

          <form action={uploadMeal} className="space-y-6">
            {/* Hidden input to ensure file is submitted if preview is set, though file input handles it naturally */}

            {/* Category Select */}
            <div className="space-y-2 group">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 group-focus-within:text-emerald-600 transition-colors" htmlFor="category">
                <Tag size={16} />
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Select a category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-2 group">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 group-focus-within:text-emerald-600 transition-colors" htmlFor="description">
                <FileText size={16} />
                Description
              </label>
              <textarea
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                id="description"
                name="description"
                placeholder="What makes this meal special?"
                rows={3}
                required
              />
            </div>

            {/* Recipe Toggle */}
            <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${hasRecipe ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-emerald-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${hasRecipe ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <ChefHat size={20} />
                </div>
                <div className="flex-1">
                  <label htmlFor="has_recipe" className="text-sm font-bold text-slate-800 cursor-pointer select-none block">
                    Include Recipe
                  </label>
                  <p className="text-xs text-slate-500 font-medium">Share the ingredients & steps</p>
                </div>
                <input
                  type="checkbox"
                  id="has_recipe"
                  name="has_recipe"
                  checked={hasRecipe}
                  onChange={(e) => setHasRecipe(e.target.checked)}
                  className="w-6 h-6 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                />
              </div>

              <AnimatePresence>
                {hasRecipe && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-2 border-t border-emerald-200/50">
                      <textarea
                        className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                        id="recipe_text"
                        name="recipe_text"
                        placeholder="Write your recipe here..."
                        rows={5}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
