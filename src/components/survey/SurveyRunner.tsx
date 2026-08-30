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
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
      // Determine section from question.section, question.category, or questionNumber range
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
      // Sort questions inside section by questionNumber
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
      // ignore storage access errors
    }
  }, [STORAGE_KEY]);

  // 3. Persist answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore storage access errors
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

  // Handle option selection
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
    // Check if all questions in current section are answered
    if (!isCurrentSectionComplete) {
      const unanswered = currentSection.questions.filter((q) => {
        const key = q._id || String(q.questionNumber);
        return !answers[key];
      });
      setSectionError(
        `Please answer all questions in ${currentSection.name} before proceeding (${unanswered.length} remaining).`
      );
      // Scroll to first unanswered question
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

  // Final survey submission
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

      // Clear local draft
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      // Store result in sessionStorage for instant result page rendering
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
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
        {/* Global Progress */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assessment Progress
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
              {answeredCount} of {totalQuestions} Answered
            </span>
          </div>
          <div className="text-xs font-bold text-blue-600">
            {progressPercent}% Completed
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Section Tabs Stepper */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-100 shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className={isCurrent ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-500'}>
                    Part {idx + 1}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {sec.shortName}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {secAnsCount}/{sec.questions.length} done
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Section Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Section {currentSectionIndex + 1} of {sections.length}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {currentSection.name}
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Answer all {currentSection.questions.length} questions in this section below.
          </p>
        </div>

        <div className="text-right shrink-0 bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
          <span className="text-xs text-blue-200 block">Section Status</span>
          <span className="text-base font-bold text-white">
            {currentSectionAnsweredCount} / {currentSection.questions.length} Answered
          </span>
        </div>
      </div>

      {/* Error alert banner if any */}
      {(sectionError || submitError) && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Attention Required</p>
            <p className="text-rose-700 text-xs mt-0.5">{sectionError || submitError}</p>
          </div>
        </div>
      )}

      {/* Section Questions Stack (All questions in current section appear together) */}
      <div className="space-y-6">
        {currentSection.questions.map((q) => {
          const qKey = q._id || String(q.questionNumber);
          const selectedOptionId = answers[qKey];

          return (
            <div
              key={q.questionNumber}
              id={`question-card-${q.questionNumber}`}
              className={`bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all ${
                selectedOptionId
                  ? 'border-slate-200/80 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-slate-900 text-white">
                  Question {q.questionNumber}
                </span>

                {selectedOptionId && (
                  <button
                    type="button"
                    onClick={() => handleClearOption(q)}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
                    title="Clear selection for this question"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Choice</span>
                  </button>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
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
                      className={`w-full text-left p-4 sm:p-4.5 rounded-xl border-2 transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                          }`}
                        >
                          {letter}
                        </div>

                        <span
                          className={`text-sm sm:text-base font-medium transition-colors ${
                            isSelected ? 'text-blue-950 font-semibold' : 'text-slate-800'
                          }`}
                        >
                          {option.optionText}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 group-hover:border-slate-400 bg-transparent'
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
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between sticky bottom-4 z-20">
        <Button
          type="button"
          variant="secondary"
          onClick={handlePreviousSection}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          {currentSectionIndex === 0 ? 'Edit Details' : 'Previous Section'}
        </Button>

        <div className="text-xs text-slate-500 hidden sm:block">
          Section {currentSectionIndex + 1} of {sections.length} &bull; Respondent: <strong className="text-slate-800">{respondent.name}</strong>
        </div>

        {isLastSection ? (
          <Button
            type="button"
            variant="success"
            onClick={() => {
              if (!isCurrentSectionComplete) {
                setSectionError(`Please complete all questions in ${currentSection.name} before reviewing.`);
                return;
              }
              setShowReviewModal(true);
            }}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Review & Finalize
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleNextSection}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Next Section
          </Button>
        )}
      </div>

      {/* Review & Submit Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review & Calculate Index"
        description="Verify your assessment summary before submitting your responses to the scoring engine."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Respondent:</span>
              <span className="font-bold text-slate-900">{respondent.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Email for Certificate:</span>
              <span className="font-bold text-slate-900 font-mono">{respondent.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-600">Total Questions Completed:</span>
              <span className="font-extrabold text-emerald-600">
                {answeredCount} of {totalQuestions} Questions
              </span>
            </div>
          </div>

          {/* Section Summary Pills */}
          <div className="space-y-1.5 pt-1">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sections Summary</h5>
            {sections.map((sec, idx) => {
              const secAns = sec.questions.filter((q) => answers[q._id || String(q.questionNumber)]).length;
              const complete = secAns === sec.questions.length;

              return (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="font-medium text-slate-800">
                    {idx + 1}. {sec.name}
                  </span>
                  <span className={`font-bold ${complete ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {secAns}/{sec.questions.length}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={isSubmitting}
            >
              Back to Survey
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitSurvey}
              isLoading={isSubmitting}
              disabled={answeredCount < totalQuestions || isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit & Calculate Index
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SurveyRunner;
