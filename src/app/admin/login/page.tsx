'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password');
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-plus-cross-pattern bg-[#0f1e3a] text-white flex flex-col justify-between selection:bg-[#c9a44c] selection:text-[#0f1e3a]">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white px-3 py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center justify-center">
            <Image
              src="/Logo-ShreeCapital.png"
              alt="Shree Capital logo"
              width={160}
              height={55}
              priority
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <span className="sr-only">Shree Capital</span>
          </div>
          <span className="text-[11px] font-medium text-[#c9a44c] bg-[#102a43] px-2.5 py-1 rounded-full border border-[#243b53]">
            Advisor Portal
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs sm:text-sm text-[#bcccdc] hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#102a43]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#102a43] border border-[#243b53] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#1f5e8c]/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#0f1e3a] text-[#c9a44c] border border-[#243b53] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">Advisor Portal</h1>
            <p className="text-xs sm:text-sm text-[#bcccdc] mt-1.5">
              Secure authentication for Shree Capital advisors
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Advisor Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627d98]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advisor@shree-capital.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0f1e3a] border border-[#243b53] rounded-xl text-white placeholder-[#627d98] focus:outline-none focus:ring-2 focus:ring-[#c9a44c]/30 focus:border-[#c9a44c] transition-all text-base sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627d98]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0f1e3a] border border-[#243b53] rounded-xl text-white placeholder-[#627d98] focus:outline-none focus:ring-2 focus:ring-[#c9a44c]/30 focus:border-[#c9a44c] transition-all text-base sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px] text-sm sm:text-base"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#0f1e3a]" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#243b53] flex items-center justify-center gap-2 text-xs text-[#9fb3c8]">
            <ShieldCheck className="w-4 h-4 text-[#c9a44c]" />
            <span>Fiduciary Level 256-bit Encryption</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#627d98]">
        Financial Ready &bull; Shree Capital Wealth Management
      </footer>
    </div>
  );
}
