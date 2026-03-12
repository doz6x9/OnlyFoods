import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { avatar_url?: string | null; email?: string | null } | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, email')
      .eq('id', user.id)
      .single();

    profile = data ?? null;
  }

  const displayEmail = profile?.email || user?.email || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-red-600 transition-colors hover:text-red-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-bold text-white">
                P
              </div>
              <span className="text-lg font-bold text-slate-800">Pécs Eats</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-red-600 sm:block"
            >
              Share a Meal
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${user.id}`}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-200"
                  title="View Profile"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayEmail || 'Profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (displayEmail || 'U').charAt(0).toUpperCase()
                  )}
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-slate-500 transition-colors hover:text-red-600"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
