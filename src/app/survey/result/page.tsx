'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  RotateCcw,
  User,
  BarChart2,
  Download,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle,
} from 'lucide-react';
import { SectionScoreBreakdown, FinancialReadinessLevel } from '@/lib/types';

import Image from 'next/image';

interface ResultData {
  responseId?: string;
  respondent: {
    name: string;
    email: string;
    age?: number;
  };
  totalScore: number;
  indexValue: number;
  readinessLevel?: FinancialReadinessLevel | string;
  sectionBreakdown?: SectionScoreBreakdown[];
  strongestDimension?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    note: string;
  };
  opportunityDimension?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    note: string;
  };
  nextActions?: string[];
  categoryScores?: Record<string, number>;
  interpretation?: {
    level: string;
    badgeColor: string;
    description: string;
    motivationalQuote?: string;
  };
  emailSent?: boolean;
  submittedAt?: string;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('survey_latest_result');
      if (stored) {
        setResult(JSON.parse(stored));
        setIsLoaded(true);
        return;
      }
    } catch {
      // ignore
    }

    const id = searchParams.get('id');
    if (id) {
      setResult({
        responseId: id,
        respondent: {
          name: 'Valued Participant',
          email: 'your email',
        },
        totalScore: 0,
        indexValue: 0,
        emailSent: true,
      });
    }
    setIsLoaded(true);
  }, [searchParams]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f5e8c]" />
      </div>
    );
  }

  const respondentName = result?.respondent?.name || 'Valued Participant';
  const indexValue = result?.indexValue !== undefined ? result.indexValue : 0;
  const level = result?.readinessLevel || result?.interpretation?.level || 'Financial Starter';
  const interpretation = result?.interpretation;
  const sectionBreakdown = result?.sectionBreakdown || [];

  const strongest = result?.strongestDimension;
  const opportunity = result?.opportunityDimension;
  const actions = result?.nextActions || [
    'Set up automated monthly savings transfers on your salary day before discretionary expenses.',
    'Build a dedicated liquid emergency reserve equivalent to 3–6 months of living expenses.',
    'Schedule an annual portfolio check-in to realign your asset allocation with your life milestones.',
  ];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/survey` : 'https://shree-capital.com/financial-ready';
  const waMessage = `How financially ready are you?\nI just took the Financial Readiness Assessment by Shree Capital to evaluate my personal finance readiness across five key dimensions.\nTake the free assessment and find out where you stand:\n${shareUrl}`;
  const waText = encodeURIComponent(waMessage);
  const waShareUrl = `https://api.whatsapp.com/send?text=${waText}`;
  const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Main Result Certificate Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#eef2f6] overflow-hidden text-center">
        {/* Top Banner (Deep Navy #0F1E3A) */}
        <div className="bg-[#0f1e3a] p-8 text-white relative border-b-4 border-[#c9a44c]">
          <div className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[#c9a44c] bg-[#102a43] border border-[#243b53] px-3.5 py-1 rounded-full mb-3">
            SHREE CAPITAL &bull; WEALTH MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Financial Ready Assessment Report
          </h1>
          <p className="text-[#bcccdc] text-xs sm:text-sm mt-1.5 max-w-md mx-auto font-serif italic">
            &ldquo;The score is not a judgement. It is a starting point.&rdquo;
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Respondent Profile Tag */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#334e68] bg-[#f8fafc] py-2.5 px-4 rounded-xl border border-[#eef2f6]">
            <User className="w-3.5 h-3.5 text-[#627d98]" />
            <span>
              Participant: <strong className="text-[#0f1e3a]">{respondentName}</strong>
              {result?.respondent?.age ? (
                <span className="text-[#627d98] font-normal"> ({result.respondent.age} yrs)</span>
              ) : null}
            </span>
          </div>

          {/* Primary Score Callout (Warm Gold & Navy) */}
          <div className="bg-[#fdf8ee] border-2 border-[#c9a44c]/60 rounded-2xl p-6 sm:p-8 relative shadow-xs">
            <div className="text-xs font-bold uppercase tracking-widest text-[#0f1e3a] flex items-center justify-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-[#c9a44c]" />
              <span>Your Financial Readiness Score</span>
            </div>

            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="text-6xl sm:text-7xl font-serif font-black text-[#0f1e3a] tracking-tight">
                {indexValue}
              </span>
              <span className="text-2xl font-bold text-[#627d98]">/ 100</span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#c9a44c]/30">
              <span className="inline-block text-xs font-extrabold px-4 py-1 rounded-full bg-[#c9a44c] text-[#0f1e3a] mb-2">
                Level: {level}
              </span>
              <p className="text-xs text-[#334e68] max-w-md mx-auto leading-relaxed">
                {interpretation?.description ||
                  'Your score reflects your current financial foundation and points toward your next high-impact opportunities.'}
              </p>
            </div>
          </div>

          {/* Strongest Area & Biggest Opportunity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Strongest Area */}
            <div className="p-5 bg-[#f8fafc] border border-[#1f5e8c]/30 rounded-2xl space-y-1.5">
              <div className="text-[11px] font-bold text-[#1f5e8c] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1f5e8c]" />
                <span>Your Strongest Foundation</span>
              </div>
              <div className="font-serif font-bold text-[#0f1e3a] text-base">
                {strongest ? `${strongest.name} (${strongest.percentage}%)` : 'Investing (54%)'}
              </div>
              <p className="text-xs text-[#334e68] leading-relaxed">
                {strongest?.note || 'Your habits and approach in this area provide a strong anchor for long-term growth.'}
              </p>
            </div>

            {/* Biggest Opportunity */}
            <div className="p-5 bg-[#fdf8ee] border border-[#c9a44c]/40 rounded-2xl space-y-1.5">
              <div className="text-[11px] font-bold text-[#c9a44c] uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#c9a44c]" />
                <span>Your Biggest Opportunity</span>
              </div>
              <div className="font-serif font-bold text-[#0f1e3a] text-base">
                {opportunity ? `${opportunity.name} (${opportunity.percentage}%)` : 'Money Management (30%)'}
              </div>
              <p className="text-xs text-[#334e68] leading-relaxed">
                {opportunity?.note || 'Focusing on this pillar will dramatically increase your overall financial stability.'}
              </p>
            </div>
          </div>

          {/* 3 Next Actions */}
          <div className="text-left bg-[#f8fafc] border border-[#eef2f6] rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-[#0f1e3a] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#1f5e8c]" />
              <span>Your Next 3 Practical Actions</span>
            </h3>
            <div className="space-y-2.5 text-xs text-[#334e68]">
              {actions.map((act, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-[#eef2f6] flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-lg bg-[#0f1e3a] text-[#c9a44c] font-bold flex items-center justify-center shrink-0 text-xs">
                    0{i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5 text-[#0f1e3a] font-medium">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section-Wise Score Breakdown Grid */}
          {sectionBreakdown.length > 0 && (
            <div className="text-left space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#1f5e8c]" />
                <h3 className="text-sm font-serif font-bold text-[#0f1e3a]">
                  Five-Dimension Scorecard
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sectionBreakdown.map((sec) => (
                  <div
                    key={sec.sectionName}
                    className="p-3.5 bg-[#f8fafc] border border-[#eef2f6] rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0f1e3a] truncate pr-2">
                        {sec.sectionName.replace(/^Section [A-Z] — /, '')}
                      </span>
                      <span className="font-bold text-[#1f5e8c] shrink-0">
                        {sec.score} / {sec.maxScore} pts
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#eef2f6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1f5e8c] to-[#c9a44c] rounded-full transition-all duration-500"
                        style={{ width: `${sec.percentage}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-[#627d98] text-right">
                      {sec.percentage}% Proficiency
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenge 5 Section */}
          <div className="p-6 bg-[#f8fafc] border border-[#eef2f6] rounded-2xl text-center space-y-3">
            <h4 className="text-sm font-serif font-bold text-[#0f1e3a]">Challenge 5 People in Your Circle</h4>
            <p className="text-xs text-[#334e68] max-w-md mx-auto leading-relaxed">
              Personal finance is rarely discussed openly. Challenge your friends and colleagues to benchmark their financial readiness!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <a href={waShareUrl} target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-md transition-all cursor-pointer">
                  Share on WhatsApp
                </button>
              </a>
              <a href={liShareUrl} target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 text-xs font-semibold bg-[#0077b5] hover:bg-[#006097] text-white rounded-md transition-all cursor-pointer">
                  Share on LinkedIn
                </button>
              </a>
            </div>
          </div>

          {/* Financial Clarity Conversation Hero Card */}
          <div className="p-6 sm:p-7 bg-[#0f1e3a] rounded-2xl text-white text-left space-y-3 border-l-4 border-[#c9a44c]">
            <div className="inline-block text-[10px] font-bold text-[#c9a44c] uppercase tracking-wider bg-[#102a43] px-3 py-0.5 rounded-full border border-[#243b53]">
              Complimentary Consultation
            </div>
            <h4 className="text-lg font-serif font-bold text-white">
              Want to Improve Your Score & Level Up Your Finances?
            </h4>
            <p className="text-xs text-[#bcccdc] leading-relaxed">
              Discuss your personalized results and next steps with a Shree Capital wealth advisor. Strictly educational, fiduciary, with zero sales pitch and no obligation.
            </p>
            <div className="pt-2">
              <a
                href="https://calendly.com/arun_agrawal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <button className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md">
                  <span>Request a Financial Clarity Conversation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            {result?.responseId ? (
              <a
                href={`/api/survey/result/${result.responseId}/pdf`}
                download
                className="block w-full"
              >
                <button className="w-full py-3.5 px-6 font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base">
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Report & Certificate</span>
                </button>
              </a>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <button className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-[#0f1e3a] bg-[#eef2f6] hover:bg-[#e2e8f0] border border-[#bcccdc] rounded-lg transition-all cursor-pointer">
                  Return to Home
                </button>
              </Link>
              <Link href="/survey" className="flex-1">
                <button className="w-full py-2.5 px-4 text-xs sm:text-sm font-medium text-[#334e68] hover:text-[#0f1e3a] bg-transparent hover:bg-[#f8fafc] border border-[#bcccdc] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-plus-cross-pattern bg-[#0f1e3a] text-white flex flex-col justify-between selection:bg-[#c9a44c] selection:text-[#0f1e3a]">
      {/* Top Header */}
      <header className="bg-[#0f1e3a]/90 backdrop-blur-md border-b border-[#243b53] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Crisp Clean Logo in White Badge */}
          <Link href="/" className="flex items-center group">
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
          </Link>

          <Link href="/" className="text-xs sm:text-sm font-medium text-[#bcccdc] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#102a43]">
            Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#1f5e8c]/15 blur-[140px] rounded-full pointer-events-none -z-10" />
        <Suspense fallback={<div className="text-center text-[#bcccdc]">Loading assessment report...</div>}>
          <ResultContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#243b53] py-6 bg-[#0f1e3a]/90 backdrop-blur-md text-xs text-[#627d98] text-center">
        Financial Ready &bull; Powered by Shree Capital (contact@shree-capital.com)
      </footer>
    </div>
  );
}
