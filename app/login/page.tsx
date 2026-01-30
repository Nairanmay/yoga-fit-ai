'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/plan' });
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Hardcoded for demo purposes
    await signIn('credentials', { 
        email: 'yogi@example.com', 
        password: 'namaste',
        callbackUrl: '/plan' 
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding & Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-teal-900">Welcome Back</h1>
            <p className="mt-2 text-stone-600">Continue your wellness journey</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 text-stone-700 py-3 rounded-xl hover:bg-stone-50 transition-all font-medium shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-stone-500">Or use email</span></div>
            </div>

            <form onSubmit={handleDemoLogin} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" defaultValue="yogi@example.com" />
                <input type="password" placeholder="Password" className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" defaultValue="namaste" />
                <button type="submit" disabled={loading} className="w-full bg-teal-800 text-white py-4 rounded-xl font-bold hover:bg-teal-900 transition-all">
                    Sign In
                </button>
            </form>
          </div>

          <p className="text-center text-sm text-stone-500">
            Don't have an account? <Link href="/signup" className="text-teal-600 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-teal-50 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 text-center max-w-lg">
           <h2 className="text-3xl font-bold text-teal-800 mb-4">"Yoga is the journey of the self, through the self, to the self."</h2>
           <p className="text-teal-600">- The Bhagavad Gita</p>
        </div>
      </div>
    </div>
  );
}