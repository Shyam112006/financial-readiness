'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Check,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { RespondentData } from './RespondentForm';
import { IQuestion } from '@/lib/types';
import Modal from '@/components/ui/Modal';

interface SurveyRunnerProps {
  questions: IQuestion[];
  respondent: RespondentData;
  onBackToRespondent: () => void;
}

interface SectionGroup {
  id: string;
  name: string;
  shortName: string;
  questions: IQuestion[];
}

export function SurveyRunner({
  questions,
  respondent,
  onBackToRespondent,
}: SurveyRunnerProps) {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const STORAGE_KEY = `survey_draft_${respondent.email}`;

  // 1. Group questions by Section
  const sections: SectionGroup[] = useMemo(() => {
    const sectionMap = new Map<string, IQuestion[]>();

    questions.forEach((q) => {
      let secName = q.section || q.category || 'General';
      if (q.questionNumber >= 1 && q.questionNumber <= 5) {
        secName = 'Section A — Money Management';
      } else if (q.questionNumber >= 6 && q.questionNumber <= 9) {
        secName = 'Section B — Emergency Preparedness';
      } else if (q.questionNumber >= 10 && q.questionNumber <= 15) {
        secName = 'Section C — Investing';
      } else if (q.questionNumber >= 16 && q.questionNumber <= 19) {
        secName = 'Section D — Risk Protection';
      } else if (q.questionNumber >= 20 && q.questionNumber <= 25) {
        secName = 'Section E — Long-Term Financial Planning';
      }

      if (!sectionMap.has(secName)) {
        sectionMap.set(secName, []);
      }
      sectionMap.get(secName)!.push(q);
    });

    const list: SectionGroup[] = [];
    sectionMap.forEach((qList, name) => {
      qList.sort((a, b) => a.questionNumber - b.questionNumber);
      const shortName = name.replace(/^Section [A-Z] — /, '');
      list.push({
        id: name,
        name,
        shortName,
        questions: qList,
      });
    });

    return list;
  }, [questions]);

  // 2. Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [STORAGE_KEY]);

  // 3. Persist answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers, STORAGE_KEY]);

  const currentSection = sections[currentSectionIndex] || sections[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Check how many questions in current section are answered
  const currentSectionAnsweredCount = useMemo(() => {
    if (!currentSection) return 0;
    return currentSection.questions.filter((q) => {
      const key = q._id || String(q.questionNumber);
      return Boolean(answers[key]);
    }).length;
  }, [currentSection, answers]);

  const isCurrentSectionComplete =
    currentSection && currentSectionAnsweredCount === currentSection.questions.length;

  const handleSelectOption = (question: IQuestion, optionId: string) => {
    const qKey = question._id || String(question.questionNumber);
    setAnswers((prev) => ({
      ...prev,
      [qKey]: optionId,
    }));
    setSectionError(null);
    setSubmitError(null);
  };

  const handleClearOption = (question: IQuestion) => {
    const qKey = question._id || String(question.questionNumber);
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[qKey];
      return updated;
    });
  };

  const handlePreviousSection = () => {
    setSectionError(null);
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToRespondent();
    }
  };

  const handleNextSection = () => {
    if (!isCurrentSectionComplete) {
      const unanswered = currentSection.questions.filter((q) => {
        const key = q._id || String(q.questionNumber);
        return !answers[key];
      });
      setSectionError(
        `Please answer all questions in ${currentSection.name} before proceeding (${unanswered.length} remaining).`
      );
      const firstUnanswered = unanswered[0];
      if (firstUnanswered) {
        const el = document.getElementById(`question-card-${firstUnanswered.questionNumber}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSectionError(null);

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowReviewModal(true);
    }
  };

  const handleSubmitSurvey = async () => {
    if (answeredCount < totalQuestions) {
      setSubmitError(`Please answer all ${totalQuestions} questions across all sections before submitting.`);
      setShowReviewModal(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit survey. Please try again.');
      }

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      sessionStorage.setItem('survey_latest_result', JSON.stringify(data.data));
      router.push(`/survey/result?id=${data.data.responseId}`);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during submission.');
      setIsSubmitting(false);
      setShowReviewModal(false);
    }
  };

  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header & Section Navigation Stepper */}
      <div className="bg-[#102a43] rounded-2xl sm:rounded-3xl shadow-xl border border-[#243b53] p-4 sm:p-6 space-y-4">
        {/* Global Progress */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-[#9fb3c8] uppercase tracking-wider">
              Diagnostic Progress
            </span>
            <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 bg-[#0f1e3a] text-[#c9a44c] border border-[#243b53] rounded-md">
              {answeredCount} of {totalQuestions} Answered
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-[#c9a44c]">
            {progressPercent}% Completed
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-[#0f1e3a] rounded-full overflow-hidden border border-[#243b53]">
          <div
            className="h-full bg-gradient-to-r from-[#1f5e8c] to-[#c9a44c] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Section Tabs Stepper */}
        <div className="pt-2 border-t border-[#243b53] grid grid-cols-2 sm:grid-cols-5 gap-2 overflow-x-auto">
          {sections.map((sec, idx) => {
            const isCurrent = idx === currentSectionIndex;
            const secAnsCount = sec.questions.filter((q) => {
              const k = q._id || String(q.questionNumber);
              return Boolean(answers[k]);
            }).length;
            const isDone = secAnsCount === sec.questions.length;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setSectionError(null);
                  setCurrentSectionIndex(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[64px] ${
                  isCurrent
                    ? 'border-[#c9a44c] bg-[#c9a44c]/20 ring-2 ring-[#c9a44c]/30 shadow-md'
                    : isDone
                    ? 'border-[#1f5e8c]/50 bg-[#0f1e3a] hover:bg-[#162e4a]'
                    : 'border-[#243b53] bg-[#0f1e3a] hover:bg-[#162e4a]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className={isCurrent ? 'text-[#c9a44c]' : isDone ? 'text-[#9fb3c8]' : 'text-[#627d98]'}>
                    Part {idx + 1}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a44c]" />}
                </div>
                <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-[#bcccdc]'}`}>
                  {sec.shortName}
                </div>
                <div className="text-[10px] text-[#627d98] mt-0.5">
                  {secAnsCount}/{sec.questions.length} done
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Section Banner (Deep Navy with Gold Accents) */}
      <div className="bg-[#102a43] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-[#c9a44c] border-y border-r border-[#243b53]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1e3a] text-[#c9a44c] text-xs font-bold uppercase tracking-wider mb-2 border border-[#243b53]">
            <Layers className="w-3.5 h-3.5 text-[#c9a44c]" />
            <span>Section {currentSectionIndex + 1} of {sections.length}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
            {currentSection.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#bcccdc] mt-1">
            Answer all {currentSection.questions.length} questions in this section below.
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 bg-[#0f1e3a] px-4 py-2.5 rounded-xl border border-[#243b53]">
          <span className="text-[11px] text-[#9fb3c8] block">Section Status</span>
          <span className="text-sm sm:text-base font-bold text-[#c9a44c]">
            {currentSectionAnsweredCount} / {currentSection.questions.length} Answered
          </span>
        </div>
      </div>

      {/* Error alert banner */}
      {(sectionError || submitError) && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Attention Required</p>
            <p className="text-rose-300 text-xs mt-0.5">{sectionError || submitError}</p>
          </div>
        </div>
      )}

      {/* Section Questions Stack */}
      <div className="space-y-6">
        {currentSection.questions.map((q) => {
          const qKey = q._id || String(q.questionNumber);
          const selectedOptionId = answers[qKey];

          return (
            <div
              key={q.questionNumber}
              id={`question-card-${q.questionNumber}`}
              className={`bg-[#102a43] rounded-2xl sm:rounded-3xl border p-5 sm:p-8 transition-all ${
                selectedOptionId
                  ? 'border-[#c9a44c]/40 shadow-lg'
                  : 'border-[#243b53] hover:border-[#334e68] shadow-md'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-[#0f1e3a] text-[#c9a44c] border border-[#243b53]">
                  Question {q.questionNumber}
                </span>

                {selectedOptionId && (
                  <button
                    type="button"
                    onClick={() => handleClearOption(q)}
                    className="text-xs text-[#9fb3c8] hover:text-[#c9a44c] flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-[#0f1e3a] cursor-pointer"
                    title="Clear selection for this question"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Choice</span>
                  </button>
                )}
              </div>

              {/* Question Text in Serif */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-white leading-snug mb-6">
                {q.questionText}
              </h3>

              {/* Options List */}
              <div className="space-y-3">
                {q.options.map((option, optIdx) => {
                  const letter = letters[optIdx] || `${optIdx + 1}`;
                  const isSelected = selectedOptionId === option.optionId;

                  return (
                    <button
                      key={option.optionId}
                      type="button"
                      onClick={() => handleSelectOption(q, option.optionId)}
                      className={`w-full text-left p-4 sm:p-4.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer min-h-[56px] ${
                        isSelected
                          ? 'border-[#c9a44c] bg-[#c9a44c]/15 shadow-md ring-1 ring-[#c9a44c]'
                          : 'border-[#243b53] hover:border-[#9fb3c8] hover:bg-[#162e4a] bg-[#0f1e3a]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#c9a44c] text-[#0f1e3a] shadow-xs'
                              : 'bg-[#102a43] text-[#9fb3c8] border border-[#243b53] group-hover:text-white'
                          }`}
                        >
                          {letter}
                        </div>

                        <span
                          className={`text-sm sm:text-base transition-colors leading-relaxed ${
                            isSelected ? 'text-white font-semibold' : 'text-[#bcccdc] group-hover:text-white'
                          }`}
                        >
                          {option.optionText}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#c9a44c] bg-[#c9a44c] text-[#0f1e3a]'
                            : 'border-[#243b53] group-hover:border-[#9fb3c8] bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Navigation Bar */}
      <div className="bg-[#102a43]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#243b53] p-3.5 sm:p-5 flex items-center justify-between sticky bottom-4 z-20">
        <button
          type="button"
          onClick={handlePreviousSection}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0f1e3a] hover:bg-[#162e4a] border border-[#243b53] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentSectionIndex === 0 ? 'Edit Profile' : 'Previous'}</span>
        </button>

        <div className="text-xs text-[#9fb3c8] hidden sm:block">
          Section {currentSectionIndex + 1} of {sections.length} &bull; Participant: <strong className="text-white">{respondent.name}</strong>
        </div>

        {isLastSection ? (
          <button
            type="button"
            onClick={() => {
              if (!isCurrentSectionComplete) {
                setSectionError(`Please complete all questions in ${currentSection.name} before reviewing.`);
                return;
              }
              setShowReviewModal(true);
            }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px]"
          >
            <span>Review & Finalize</span>
            <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextSection}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px]"
          >
            <span>Next Section</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Review & Submit Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review & Calculate Readiness Score"
        description="Verify your assessment summary before submitting your responses to the scoring engine."
        maxWidth="lg"
      >
        <div className="space-y-4 text-slate-800">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500">Participant:</span>
              <span className="font-bold text-slate-900">{respondent.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500">Email for Certificate:</span>
              <span className="font-bold text-slate-900 font-mono">{respondent.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-500">Total Questions Completed:</span>
              <span className="font-extrabold text-[#1f5e8c]">
                {answeredCount} of {totalQuestions} Questions
              </span>
            </div>
          </div>

          {/* Section Summary Pills */}
          <div className="space-y-1.5 pt-1 max-h-60 overflow-y-auto">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sections Summary</h5>
            {sections.map((sec, idx) => {
              const secAns = sec.questions.filter((q) => answers[q._id || String(q.questionNumber)]).length;
              const complete = secAns === sec.questions.length;

              return (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="font-medium text-slate-900 truncate pr-2">
                    {idx + 1}. {sec.name}
                  </span>
                  <span className={`font-bold shrink-0 ${complete ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {secAns}/{sec.questions.length}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              Back to Questions
            </button>
            <button
              type="button"
              onClick={handleSubmitSurvey}
              disabled={answeredCount < totalQuestions || isSubmitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Calculating...' : 'Submit & Generate Report'}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SurveyRunner;
