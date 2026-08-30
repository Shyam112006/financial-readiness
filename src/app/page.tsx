'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Award,
  BarChart2,
  Sparkles,
  Target,
  CheckCircle2,
  FileText,
  Lock,
  Menu,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f1e3a] flex flex-col justify-between selection:bg-[#c9a44c] selection:text-[#0f1e3a] overflow-x-hidden">
      {/* ── Top Navigation (Responsive Shree Capital Navbar) ─────────────── */}
      <header className="w-full bg-white border-b border-[#eef2f6] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo at 70% Balanced Proportion */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/Logo-ShreeCapital.png"
              alt="Shree Capital logo"
              width={200}
              height={70}
              priority
              className="h-9 sm:h-10 md:h-11 w-auto object-contain"
            />
            <span className="sr-only">Shree Capital</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#334e68]">
            <Link href="/" className="text-[#0f1e3a] font-semibold hover:text-[#1f5e8c] transition-colors">
              Home
            </Link>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">About</span>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">Services</span>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">Insights</span>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">Calculators</span>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">Newsletter</span>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">Careers</span>
            <span className="hover:text-[#1f5e8c] transition-colors cursor-pointer">Contact</span>
          </nav>

          {/* Desktop Action Buttons & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin/login" className="hidden sm:block">
              <button className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#0f1e3a] border border-[#0f1e3a] rounded-md hover:bg-[#f8fafc] transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px]">
                <Lock className="w-3.5 h-3.5 text-[#334e68]" />
                <span>Login</span>
              </button>
            </Link>
            <Link href="/survey">
              <button className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1f5e8c] hover:bg-[#184d73] rounded-md shadow-xs transition-all cursor-pointer min-h-[38px]">
                Take Assessment
              </button>
            </Link>

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#0f1e3a] hover:bg-[#f8fafc] border border-[#eef2f6]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#eef2f6] bg-white px-4 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3 text-sm font-medium text-[#334e68]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#0f1e3a] font-semibold py-1.5"
              >
                Home
              </Link>
              <Link
                href="/survey"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1f5e8c] font-semibold py-1.5"
              >
                Financial Ready Assessment
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#334e68] py-1.5 flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#627d98]" />
                <span>Advisor Portal</span>
              </Link>
              <a
                href="mailto:contact@shree-capital.com"
                className="text-[#334e68] py-1.5"
              >
                Contact Support
              </a>
            </div>

            <div className="pt-3 border-t border-[#eef2f6]">
              <Link href="/survey" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <button className="w-full py-3 text-sm font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-lg shadow-sm">
                  Take Assessment
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Deep Navy with Plus-Cross Grid & Exact New Headline) ─ */}
      <section className="bg-plus-cross-pattern bg-[#0f1e3a] text-white py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[700px] h-[300px] sm:h-[400px] bg-[#1f5e8c]/20 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#102a43] border border-[#243b53] text-[#c9a44c] text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#c9a44c] shrink-0" />
            <span>Complimentary 5-Dimension Diagnostic</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight leading-[1.15] sm:leading-[1.1] text-white">
            How financially ready are you?
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-[#bcccdc] max-w-2xl mx-auto leading-relaxed pt-1 sm:pt-2 px-2">
            A quick assessment of your financial readiness across five key areas.
          </p>

          {/* Know your score. Know your next step. */}
          <div className="py-2">
            <span className="inline-block text-lg sm:text-2xl text-[#c9a44c] font-serif font-bold tracking-wide">
              Know your score. Know your next step.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href="/survey" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3.5 text-sm sm:text-base font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-md shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]">
                <span>Take Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            {/* <Link href="/admin/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-7 py-3.5 text-sm sm:text-base font-medium text-white border border-[#243b53] hover:border-[#9fb3c8] hover:bg-[#102a43] rounded-md transition-all cursor-pointer min-h-[48px]">
                Advisor Portal
              </button>
            </Link> */}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="pt-12 sm:pt-20">
          <div className="w-6 h-10 rounded-full border-2 border-[#627d98] flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 bg-[#c9a44c] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── 6 Cards: What You Will Get Out of the Assessment ───────────────────── */}
      <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-[#c9a44c] uppercase tracking-[0.2em] block">
            WHAT YOU WILL GET
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#0f1e3a] tracking-tight">
            What You Gain from the Assessment
          </h2>
          <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
            A comprehensive personal finance diagnostic designed to provide complete clarity, actionable insights.
          </p>
        </div>

        {/* 6 What-You-Get Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#eef2f6] shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f1e3a] text-[#c9a44c] flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0f1e3a]">Financial Readiness Score</h3>
            <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
              Receive a single, calibrated benchmark score from 0 to 100 measuring your true financial resilience, discipline, and long-term preparedness.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#eef2f6] shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f1e3a] text-[#c9a44c] flex items-center justify-center shadow-xs">
              <BarChart2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0f1e3a]">Five-Dimension Scorecard</h3>
            <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
              Explore a granular score breakdown across Money Management, Emergency Preparedness, Investing, Risk Protection, and Long-Term Planning.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#eef2f6] shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f1e3a] text-[#c9a44c] flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0f1e3a]">Strongest Foundation</h3>
            <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
              Identify the positive habits and financial strengths that provide your greatest stability and act as anchors for future wealth growth.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#eef2f6] shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f1e3a] text-[#c9a44c] flex items-center justify-center shadow-xs">
              <Target className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0f1e3a]">Biggest Opportunity</h3>
            <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
              Pinpoint your most critical blindspot and discover high-impact areas where focused changes will dramatically improve your score.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#eef2f6] shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f1e3a] text-[#c9a44c] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0f1e3a]">3 Practical Actions</h3>
            <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
              Get 3 concrete, prioritized action steps tailored specifically to your responses that you can implement in the next 30 days.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#eef2f6] shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f1e3a] text-[#c9a44c] flex items-center justify-center shadow-xs">
              <FileText className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0f1e3a]">Official PDF Report</h3>
            <p className="text-xs sm:text-sm text-[#334e68] leading-relaxed">
              Download your comprehensive personal financial readiness report, delivered automatically to your email inbox.
            </p>
          </div>
        </div>
      </section>

      {/* ── Call To Action Banner ────────────────────────────────────────────── */}
      <section className="bg-[#0f1e3a] text-white py-14 sm:py-18 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white">
            Discover Your Financial Readiness Score Today
          </h2>
          <p className="text-xs sm:text-sm text-[#bcccdc] max-w-xl mx-auto leading-relaxed">
            Take the confidential assessment to assess your preparedness and receive your personalized action report.
          </p>
          <div className="pt-2">
            <Link href="/survey">
              <button className="px-8 sm:px-10 py-3.5 text-sm sm:text-base font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-md shadow-md transition-all cursor-pointer inline-flex items-center gap-2 min-h-[48px]">
                <span>Take Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#eef2f6] py-8 sm:py-10 text-xs text-[#627d98]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
            <Image
              src="/Logo-ShreeCapital.png"
              alt="Shree Capital logo"
              width={160}
              height={50}
              className="h-8 w-auto object-contain"
            />
            <span>&bull;</span>
            <span>Financial Ready Assessment</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/admin/login" className="hover:text-[#0f1e3a] transition-colors">
              Advisor Portal
            </Link>
            <Link href="/survey" className="hover:text-[#0f1e3a] transition-colors">
              Take Assessment
            </Link>
            <a href="mailto:contact@shree-capital.com" className="hover:text-[#0f1e3a] transition-colors">
              contact@shree-capital.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
