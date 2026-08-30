'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  GripVertical,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuestionModal } from '@/components/admin/QuestionModal';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { IQuestion } from '@/lib/types';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/questions');
      const data = await res.json();

      if (res.ok && data.success) {
        setQuestions(data.data || []);
      } else {
        setError(data.message || 'Failed to load questions');
      }
    } catch {
      setError('Could not connect to the question server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (q: IQuestion) => {
    setEditingQuestion(q);
    setModalOpen(true);
  };

  const handleToggleActive = async (q: IQuestion) => {
    try {
      const res = await fetch(`/api/admin/questions/${q._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...q,
          isActive: !q.isActive,
        }),
      });

      if (res.ok) {
        setToast(`Question #${q.questionNumber} marked as ${!q.isActive ? 'Active' : 'Inactive'}`);
        fetchQuestions();
      }
    } catch {
      setToast('Error updating status');
    } finally {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/questions/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast(`Question #${deleteTarget.questionNumber} deleted`);
        setDeleteTarget(null);
        fetchQuestions();
      } else {
        setError(data.message || 'Failed to delete question');
      }
    } catch {
      setError('Server error during question deletion');
    } finally {
      setIsDeleting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Question Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure assessment questions, customize score allocations, and manage active states
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Question
        </Button>
      </div>

      {/* Questions list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading question list...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Questions Defined</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Get started by adding questions or run the seed script to import standard survey questions.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            Create First Question
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q._id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                      Q{q.questionNumber}
                    </span>
                    {q.category && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {q.category}
                      </span>
                    )}
                    <Badge variant={q.isActive ? 'success' : 'default'}>
                      {q.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.questionText}
                  </h3>

                  {/* Options Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                    {q.options.map((opt, idx) => (
                      <div
                        key={opt.optionId || idx}
                        className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-700 truncate font-medium">
                          {String.fromCharCode(65 + idx)}. {opt.optionText}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                          {opt.score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <Button
                    variant={q.isActive ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleActive(q)}
                  >
                    {q.isActive ? 'Deactivate' : 'Activate'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(q)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>

                  <button
                    onClick={() => setDeleteTarget(q)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Question Modal */}
      <QuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchQuestions}
        question={editingQuestion}
      />

      {/* Delete Question Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        message={`Are you sure you want to delete Question #${deleteTarget?.questionNumber}: "${deleteTarget?.questionText}"? Note: Historical respondent snapshots will not be affected.`}
        confirmText="Delete Question"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
