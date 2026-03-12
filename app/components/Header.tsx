import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import { Salad, Plus, LogOut, LayoutDashboard } from 'lucide-react';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { avatar_url?: string | null; email?: string | null; role?: string } | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, email, role')
      .eq('id', user.id)
      .single();

    profile = data ?? null;
  }

  const displayEmail = profile?.email || user?.email || '';
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-500/40 group-hover:rotate-3">
                <Salad size={20} className="stroke-[2.5px]" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20"></div>
              </div>
              <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 group-hover:to-emerald-600 transition-all duration-300">
                OnlyFoods
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/upload"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Post</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
              >
                <LayoutDashboard size={18} />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-6 sm:border-l-2 border-slate-100">
                <NotificationBell userId={user.id} />

                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${user.id}`}
                    className="relative group block"
                    title="View Profile"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white ring-2 ring-slate-100 transition-all duration-300 group-hover:ring-emerald-400 group-hover:shadow-md">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={displayEmail || 'Profile'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
                          {(displayEmail || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Sign Out"
                    >
                      <LogOut size={20} />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
