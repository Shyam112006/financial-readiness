'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { IQuestion, IOption } from '@/lib/types';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  question?: IQuestion | null;
}

export function QuestionModal({
  isOpen,
  onClose,
  onSaved,
  question,
}: QuestionModalProps) {
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [questionText, setQuestionText] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [options, setOptions] = useState<IOption[]>([
    { optionId: 'opt_1', optionText: 'Never', score: 0 },
    { optionId: 'opt_2', optionText: 'Rarely', score: 1 },
    { optionId: 'opt_3', optionText: 'Sometimes', score: 2 },
    { optionId: 'opt_4', optionText: 'Frequently', score: 3 },
    { optionId: 'opt_5', optionText: 'Daily', score: 4 },
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setQuestionNumber(question.questionNumber);
      setQuestionText(question.questionText);
      setCategory(question.category || 'General');
      setIsActive(question.isActive !== undefined ? question.isActive : true);
      setOptions(
        question.options.map((o) => ({
          optionId: o.optionId,
          optionText: o.optionText,
          score: o.score,
        }))
      );
    } else {
      setQuestionNumber(1);
      setQuestionText('');
      setCategory('General');
      setIsActive(true);
      setOptions([
        { optionId: 'opt_1', optionText: 'Strongly Disagree', score: 0 },
        { optionId: 'opt_2', optionText: 'Disagree', score: 1 },
        { optionId: 'opt_3', optionText: 'Neutral', score: 2 },
        { optionId: 'opt_4', optionText: 'Agree', score: 3 },
        { optionId: 'opt_5', optionText: 'Strongly Agree', score: 4 },
      ]);
    }
    setError(null);
  }, [question, isOpen]);

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions([
      ...options,
      {
        optionId: `opt_${Date.now()}_${nextIdx}`,
        optionText: '',
        score: nextIdx - 1,
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError('A question must have at least 2 options');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
    setError(null);
  };

  const handleOptionChange = (
    index: number,
    field: 'optionText' | 'score',
    value: string | number
  ) => {
    const updated = [...options];
    if (field === 'score') {
      updated[index].score = Number(value);
    } else {
      updated[index].optionText = String(value);
    }
    setOptions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Please enter the question text');
      return;
    }

    if (options.some((o) => !o.optionText.trim())) {
      setError('All options must have non-empty text');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        questionNumber: Number(questionNumber),
        questionText: questionText.trim(),
        category: category.trim(),
        isActive,
        options,
      };

      const isEdit = Boolean(question?._id);
      const url = isEdit ? `/api/admin/questions/${question!._id}` : '/api/admin/questions';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save question');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving question');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? `Edit Question #${question.questionNumber}` : 'Create New Question'}
      description="Configure question text, category, and score values for each option."
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Question Number
            </label>
            <input
              type="number"
              min="1"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Wellness, Health"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="true">Active (Shown in survey)</option>
              <option value="false">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Question Prompt <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g. How frequently do you exercise each week?"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Options & Scores */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700">
              Options & Scores <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {options.map((opt, idx) => (
              <div
                key={opt.optionId || idx}
                className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
              >
                <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + idx)}
                </div>

                <input
                  type="text"
                  value={opt.optionText}
                  onChange={(e) => handleOptionChange(idx, 'optionText', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Score:</span>
                  <input
                    type="number"
                    value={opt.score}
                    onChange={(e) => handleOptionChange(idx, 'score', e.target.value)}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-center font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  disabled={options.length <= 2}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                  title="Delete option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default QuestionModal;
