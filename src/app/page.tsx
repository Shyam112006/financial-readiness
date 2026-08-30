'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  BarChart2,
  MailCheck,
  CheckCircle2,
  Lock,
  Target,
  Compass,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-black text-sm shadow-md">
              SC
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight">
                Shree Capital
              </span>
              <span className="text-[10px] text-sky-400 font-medium">
                Financial Ready™️
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Advisor Portal</span>
            </Link>
            <Link href="/survey">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Assessment
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center max-w-5xl mx-auto relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Complimentary 5-Dimension Diagnostic</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl">
          How financially ready are you?
        </h1>

        {/* Core Philosophy Callout */}
        <blockquote className="mt-5 text-sm sm:text-base text-sky-300 font-medium italic border-l-2 border-sky-500 pl-4 max-w-xl mx-auto">
          &ldquo;The score is not a judgement. It is a starting point.&rdquo;
        </blockquote>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Evaluate your personal finance awareness across Money Management, Emergency Preparedness, Investing, Risk Protection, and Long-Term Planning. Receive your score, personalized action steps, and official certificate instantly.
        </p>

        {/* 5 Pillars Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 text-xs text-slate-300">
          <span className="bg-slate-800/90 border border-slate-700/70 px-3 py-1 rounded-full">
            1. Money Management
          </span>
          <span className="bg-slate-800/90 border border-slate-700/70 px-3 py-1 rounded-full">
            2. Emergency Preparedness
          </span>
          <span className="bg-slate-800/90 border border-slate-700/70 px-3 py-1 rounded-full">
            3. Investing Discipline
          </span>
          <span className="bg-slate-800/90 border border-slate-700/70 px-3 py-1 rounded-full">
            4. Risk Protection
          </span>
          <span className="bg-slate-800/90 border border-slate-700/70 px-3 py-1 rounded-full">
            5. Long-Term Planning
          </span>
        </div>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/survey" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto text-base px-8 py-4 font-semibold shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all bg-sky-600 hover:bg-sky-500 text-white border-0"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Take Free Assessment (~3 mins)
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-600 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-sky-400 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Objective Benchmarking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gain a non-judgemental snapshot of where your habits stand across 5 distinct financial dimensions.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-600 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Official PDF Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive an attached vector PDF report with question-by-question marks and a readiness certificate.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-600 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">3 Practical Next Steps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Actionable, high-impact recommendations to improve your financial preparedness without product pitches.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950/60 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Shree Capital &bull; Financial Ready™️. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
              Advisor Login
            </Link>
            <Link href="/survey" className="hover:text-slate-300 transition-colors">
              Take Assessment
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
