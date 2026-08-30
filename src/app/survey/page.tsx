'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { RespondentForm, RespondentData } from '@/components/survey/RespondentForm';
import { SurveyRunner } from '@/components/survey/SurveyRunner';
import { IQuestion } from '@/lib/types';
import Button from '@/components/ui/Button';

import Image from 'next/image';

export default function SurveyPage() {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [respondent, setRespondent] = useState<RespondentData | null>(null);

  // Fetch questions from API
  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/questions');
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load questions');
        }

        setQuestions(data.questions || []);
      } catch (err) {
        console.error('Failed to load survey questions:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Could not connect to the survey server. Please check your connection and try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-plus-cross-pattern bg-[#0f1e3a] text-white flex flex-col justify-between selection:bg-[#c9a44c] selection:text-[#0f1e3a]">
      {/* Top Header */}
      <header className="bg-white backdrop-blur-md border-b border-[#243b53] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Crisp Clean Logo in White Badge */}
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
          

          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-[#bcccdc] text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102a43]"
          >
            <ArrowLeft className="w-4 h-4 color-black"  />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Survey Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center relative">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#1f5e8c]/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#c9a44c] mb-4" />
            <h3 className="text-lg font-serif font-bold text-white">Preparing Your Assessment...</h3>
            <p className="text-xs text-[#9fb3c8] mt-1">Fetching 5-dimension diagnostic questions and scoring metrics</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-[#102a43] rounded-2xl p-8 border border-rose-500/30 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-4 border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white mb-2">Unable to Load Survey</h3>
            <p className="text-sm text-[#bcccdc] mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#c9a44c] hover:bg-[#b8933b] text-[#0f1e3a] font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="max-w-md mx-auto bg-[#102a43] rounded-2xl p-8 border border-[#c9a44c]/30 shadow-xl text-center">
            <h3 className="text-lg font-serif font-bold text-white mb-2">Assessment Not Initialized</h3>
            <p className="text-sm text-[#bcccdc] mb-6">
              No questions found. Please configure questions in the advisor portal.
            </p>
            <Link href="/">
              <button className="px-6 py-2.5 bg-[#102a43] hover:bg-[#243b53] text-white border border-[#243b53] rounded-lg text-sm transition-all cursor-pointer">
                Return to Home
              </button>
            </Link>
          </div>
        ) : !respondent ? (
          <RespondentForm
            onSubmit={(data) => setRespondent(data)}
            totalQuestions={questions.length}
          />
        ) : (
          <SurveyRunner
            questions={questions}
            respondent={respondent}
            onBackToRespondent={() => setRespondent(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#243b53] py-6 bg-[#0f1e3a]/90 backdrop-blur-md text-xs text-[#627d98] text-center">
        <div className="max-w-5xl mx-auto px-4">
          Financial Ready &bull; Powered by Shree Capital (contact@shree-capital.com)
        </div>
      </footer>
    </div>
  );
}
