'use client';

import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { IQuestion } from '@/lib/types';

interface QuestionCardProps {
  question: IQuestion;
  currentNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  onClearOption: () => void;
}

export function QuestionCard({
  question,
  currentNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onClearOption,
}: QuestionCardProps) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-10 transition-all duration-300">
      {/* Category & Question Number meta */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            Question {currentNumber} of {totalQuestions}
          </span>
          {question.category && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {question.category}
            </span>
          )}
        </div>

        {selectedOptionId && (
          <button
            onClick={onClearOption}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
            title="Clear selection for this question"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear choice</span>
          </button>
        )}
      </div>

      {/* Question Text */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-8">
        {question.questionText}
      </h2>

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const letter = letters[idx] || `${idx + 1}`;
          const isSelected = selectedOptionId === option.optionId;

          return (
            <button
              key={option.optionId}
              type="button"
              onClick={() => onSelectOption(option.optionId)}
              className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-between group cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0 pr-3">
                {/* Option Badge (A, B, C...) */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  {letter}
                </div>

                {/* Option Text */}
                <span
                  className={`text-base font-medium transition-colors ${
                    isSelected ? 'text-blue-900 font-semibold' : 'text-slate-800'
                  }`}
                >
                  {option.optionText}
                </span>
              </div>

              {/* Checkmark Indicator */}
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 group-hover:border-slate-400 bg-transparent'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard navigation helper */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="hidden sm:inline">
          Tip: Click an option or use number/letter shortcuts
        </span>
        <span className="text-slate-400">
          {selectedOptionId ? '✓ Answer recorded' : 'Select an answer to proceed'}
        </span>
      </div>
    </div>
  );
}

export default QuestionCard;
