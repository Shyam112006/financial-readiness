'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  MailCheck,
  Award,
  RotateCcw,
  User,
  ShieldCheck,
  BarChart2,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { SectionScoreBreakdown, FinancialReadinessLevel } from '@/lib/types';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const respondentName = result?.respondent?.name || 'Valued Participant';
  const respondentEmail = result?.respondent?.email || '';
  const indexValue = result?.indexValue !== undefined ? result.indexValue : 0;
  const level = result?.readinessLevel || result?.interpretation?.level || 'Financial Starter';
  const interpretation = result?.interpretation;
  const sectionBreakdown = result?.sectionBreakdown || [];

  const strongest = result?.strongestDimension;
  const opportunity = result?.opportunityDimension;
  const actions = result?.nextActions || [
    'Set up automated savings transfers every month before any discretionary expenses.',
    'Build a dedicated emergency reserve equivalent to 3–6 months of living expenses in a liquid account.',
    'Map your investments to specific time-horizon goals rather than chasing short-term returns.',
  ];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/survey` : 'https://shree-capital.com/financial-ready';
  const waText = encodeURIComponent(
    `Hey! I just took the Financial Ready™️ Assessment by Shree Capital to evaluate my personal finances across 5 key pillars. Check where you stand here (it's free): ${shareUrl}`
  );
  const waShareUrl = `https://api.whatsapp.com/send?text=${waText}`;
  const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Main Result Certificate Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center">
        {/* Top Banner */}
        <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 p-8 text-white relative">
          <div className="inline-block text-[11px] font-bold tracking-widest uppercase text-sky-400 bg-sky-950/60 border border-sky-500/30 px-3 py-1 rounded-full mb-3">
            Shree Capital • Wealth Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial Ready™️ Report
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
            &ldquo;The score is not a judgement. It is a starting point.&rdquo;
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Respondent Profile Tag */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200/80">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Participant: <strong className="text-slate-900">{respondentName}</strong>
              {result?.respondent?.age ? (
                <span className="text-slate-500 font-normal"> ({result.respondent.age} yrs)</span>
              ) : null}
            </span>
          </div>

          {/* Primary Score Callout */}
          <div className="bg-gradient-to-b from-emerald-50/90 to-teal-50/80 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 relative shadow-xs">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 flex items-center justify-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Your Financial Readiness Score</span>
            </div>

            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="text-6xl sm:text-7xl font-black text-emerald-700 tracking-tight">
                {indexValue}
              </span>
              <span className="text-2xl font-bold text-emerald-600/70">/ 100</span>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200">
              <span className="inline-block text-xs font-extrabold px-3.5 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300 mb-2">
                Level: {level}
              </span>
              <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                {interpretation?.description ||
                  'Your score reflects your current financial foundation and points toward your next high-impact opportunities.'}
              </p>
            </div>
          </div>

          {/* Strongest Area & Biggest Opportunity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Strongest Area */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Strongest Foundation</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {strongest ? `${strongest.name} (${strongest.percentage}%)` : 'Money Management'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {strongest?.note || 'Your habits and approach in this area provide a strong anchor for long-term growth.'}
              </p>
            </div>

            {/* Biggest Opportunity */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1.5">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Your Biggest Opportunity</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {opportunity ? `${opportunity.name} (${opportunity.percentage}%)` : 'Risk Protection'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {opportunity?.note || 'Focusing on this pillar will dramatically increase your overall financial stability.'}
              </p>
            </div>
          </div>

          {/* 3 Next Actions */}
          <div className="text-left bg-blue-50/50 border border-blue-200/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>3 Practical Next Steps</span>
            </h3>
            <div className="space-y-2 text-xs text-blue-950">
              {actions.map((act, i) => (
                <div key={i} className="p-2.5 bg-white rounded-xl border border-blue-100 flex items-start gap-2.5 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section-Wise Score Breakdown Grid */}
          {sectionBreakdown.length > 0 && (
            <div className="text-left space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Five-Dimension Scorecard
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sectionBreakdown.map((sec) => (
                  <div
                    key={sec.sectionName}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate pr-2">
                        {sec.sectionName.replace(/^Section [A-Z] — /, '')}
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {sec.score} / {sec.maxScore} pts
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${sec.percentage}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-500 text-right">
                      {sec.percentage}% Proficiency
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenge 5 Section */}
          <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl text-center space-y-3">
            <h4 className="text-sm font-bold text-purple-950">Challenge 5 People You Know</h4>
            <p className="text-xs text-purple-800 max-w-md mx-auto leading-relaxed">
              Personal finance is rarely discussed openly. Challenge your friends and colleagues to benchmark their financial readiness!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <a href={waShareUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-0">
                  Share on WhatsApp
                </Button>
              </a>
              <a href={liShareUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-[#0077b5] hover:bg-[#006097] text-white border-0">
                  Share on LinkedIn
                </Button>
              </a>
            </div>
          </div>

          {/* Financial Clarity Conversation Invitation */}
          <div className="p-6 bg-slate-900 rounded-2xl text-white text-left space-y-3">
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Want to Improve Your Score?
            </div>
            <h4 className="text-base font-bold text-white">
              Schedule a Financial Clarity Conversation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Discuss your results and next steps with a Shree Capital wealth advisor. Our sessions are strictly educational with zero sales pressure and no obligation to purchase financial products.
            </p>
            <a
              href="mailto:contact@shree-capital.com?subject=Requesting%20Financial%20Clarity%20Conversation"
              className="inline-block"
            >
              <Button size="sm" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold border-0" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Request Clarity Conversation
              </Button>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            {result?.responseId ? (
              <a
                href={`/api/survey/result/${result.responseId}/pdf`}
                download
                className="block w-full"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-md shadow-emerald-600/20"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Official PDF Report & Certificate
                </Button>
              </a>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <Button variant="secondary" size="md" className="w-full">
                  Return to Home
                </Button>
              </Link>
              <Link href="/survey" className="flex-1">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  rightIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Retake Assessment
                </Button>
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-slate-800 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              SC
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900">Shree Capital</span>
              <span className="text-[10px] text-slate-500 font-medium">Financial Ready™️</span>
            </div>
          </Link>

          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex items-center justify-center">
        <Suspense fallback={<div className="text-center text-slate-400">Loading assessment result...</div>}>
          <ResultContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 bg-white text-xs text-slate-400 text-center">
        Financial Ready™️ • Powered by Shree Capital (contact@shree-capital.com)
      </footer>
    </div>
  );
}
