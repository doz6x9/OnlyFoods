'use client';

import { login, signup } from './actions';
import { motion } from 'framer-motion';
import { Salad, ArrowRight, ChefHat, Flame, Users } from 'lucide-react';

export default function LoginPage() {
  const features = [
    { icon: ChefHat, title: "Share Your Creations", text: "Show off your culinary skills." },
    { icon: Flame, title: "Discover Hot Spots", text: "Find the best eats in town." },
    { icon: Users, title: "Foodie Community", text: "Connect with local food lovers." },
  ];

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-50 scale-105 animate-[kenburns_25s_infinite_alternate]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1543353071-87df2097aa4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/60 to-transparent z-10" />

        <div className="relative z-20 text-white p-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-500/20">
                <Salad size={28} className="text-white" />
              </div>
              <span className="text-3xl font-black tracking-tight">OnlyFoods</span>
            </div>

            <h1 className="text-6xl font-black mb-6 leading-[1.1] tracking-tight">
              Fresh, Local, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Delicious</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed font-medium">
              Join the most vibrant food community in Pécs. Share recipes, find inspiration, and connect with fellow foodies.
            </p>

            <div className="space-y-5">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="flex items-center gap-5 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <feature.icon size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                    <p className="text-sm text-slate-400 font-medium">{feature.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 bg-slate-50/50 lg:bg-white relative">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto relative z-10"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium text-lg">Ready to find your next meal?</p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-sm font-bold text-slate-700 transition-colors group-focus-within:text-emerald-600 ml-1" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-base font-medium shadow-sm hover:border-slate-200"
                name="email"
                placeholder="you@pte.hu"
                required
                type="email"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700 transition-colors group-focus-within:text-emerald-600" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Forgot password?</a>
              </div>
              <input
                className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-base font-medium shadow-sm hover:border-slate-200"
                type="password"
                name="password"
                required
              />
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <button
                formAction={login}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] text-lg"
              >
                <span>Sign In</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                formAction={signup}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-base"
              >
                Create Account
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-xs font-medium text-slate-400">
            By signing in, you agree to our <a href="#" className="underline hover:text-slate-600 decoration-slate-300 underline-offset-2">Terms</a> and <a href="#" className="underline hover:text-slate-600 decoration-slate-300 underline-offset-2">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
