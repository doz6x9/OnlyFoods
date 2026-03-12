import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">Pécs Eats 🍽️</h1>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md font-semibold text-gray-700" htmlFor="email">
          University Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@pte.hu"
          required
        />

        <label className="text-md font-semibold text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <button
          formAction={login}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 mb-2"
        >
          Sign In
        </button>
        <button
          formAction={signup}
          className="border border-gray-300 hover:bg-gray-100 rounded-md px-4 py-2 text-gray-700 mb-2"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}