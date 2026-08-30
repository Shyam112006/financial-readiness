'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { RespondentForm, RespondentData } from '@/components/survey/RespondentForm';
import { SurveyRunner } from '@/components/survey/SurveyRunner';
import { IQuestion } from '@/lib/types';
import Button from '@/components/ui/Button';

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

          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Survey Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <h3 className="text-base font-semibold text-slate-800">Preparing Your Assessment...</h3>
            <p className="text-xs text-slate-400 mt-1">Fetching survey questions and options</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-rose-200 shadow-lg text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Survey</h3>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry Loading
            </Button>
          </div>
        ) : questions.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-amber-200 shadow-lg text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Survey Not Initialized</h3>
            <p className="text-sm text-slate-600 mb-6">
              No questions found. Please seed the database or configure questions in the admin panel.
            </p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
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
      <footer className="border-t border-slate-200/80 py-6 bg-white text-xs text-slate-400 text-center">
        <div className="max-w-5xl mx-auto px-4">
          Financial Ready™️ • Powered by Shree Capital (contact@shree-capital.com)
        </div>
      </footer>
    </div>
  );
}
