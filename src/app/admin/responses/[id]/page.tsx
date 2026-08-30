'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Award,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { ISurveyResponse } from '@/lib/types';

export default function AdminResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [response, setResponse] = useState<ISurveyResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    async function loadResponse() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/responses/${resolvedParams.id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Response record not found');
        }

        setResponse(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching response');
      } finally {
        setIsLoading(false);
      }
    }

    loadResponse();
  }, [resolvedParams.id]);

  const handleResendEmail = async () => {
    if (!response) return;
    try {
      setIsResending(true);
      setResendStatus(null);
      const res = await fetch(`/api/admin/responses/${resolvedParams.id}/resend-email`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResendStatus('Email successfully dispatched!');
        setResponse((prev) => (prev ? { ...prev, emailSent: true } : null));
      } else {
        setResendStatus(`Failed: ${data.message || 'Email service error'}`);
      }
    } catch {
      setResendStatus('Server error sending email');
    } finally {
      setIsResending(false);
      setTimeout(() => setResendStatus(null), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/responses/${resolvedParams.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/responses');
      } else {
        setError(data.message || 'Failed to delete');
      }
    } catch {
      setError('Server error during deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading full response snapshot...</p>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-rose-200 text-center shadow-lg">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Record Not Found</h3>
        <p className="text-xs text-slate-600 mb-6">{error || 'This response could not be located.'}</p>
        <Link href="/admin/responses">
          <Button variant="outline" size="sm">
            Back to Responses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/responses"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Responses</span>
        </Link>

        <div className="flex items-center gap-3">
          <a href={`/api/admin/responses/${resolvedParams.id}/pdf`} download>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-blue-600" />}
            >
              Download PDF Report
            </Button>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            isLoading={isResending}
            leftIcon={<Mail className="w-4 h-4 text-emerald-600" />}
          >
            Resend Email
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {resendStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resendStatus}</span>
        </div>
      )}

      {/* Respondent & Score Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Respondent Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Respondent Information</CardTitle>
            <Badge variant={response.emailSent ? 'success' : 'warning'}>
              {response.emailSent ? 'Email Delivered' : 'Email Pending/Failed'}
            </Badge>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name
              </span>
              <p className="font-bold text-slate-900">{response.respondent.name}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </span>
              <p className="font-bold text-slate-900 font-mono text-xs">{response.respondent.email}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Age
              </span>
              <p className="font-bold text-slate-900">{response.respondent.age ? `${response.respondent.age} years old` : 'Not recorded'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Submission Timestamp
              </span>
              <p className="font-semibold text-slate-900 text-xs">
                {new Date(response.submittedAt).toLocaleString()}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Email Delivery Time
              </span>
              <p className="font-semibold text-slate-900 text-xs">
                {response.emailSentAt ? new Date(response.emailSentAt).toLocaleString() : 'Not recorded'}
              </p>
            </div>
          </div>
        </Card>

        {/* Calculated Result Card */}
        <Card className="bg-linear-to-b from-blue-900 to-slate-900 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Calculated Index
              </span>
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-5xl font-black text-white mt-4">{response.indexValue}</div>
            <div className="text-xs text-blue-200 mt-2 font-medium">
              Total Raw Score: {response.totalScore}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Historical Snapshot</span>
          </div>
        </Card>
      </div>

      {/* Complete 25 Questions Snapshot */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Detailed Answers Snapshot ({response.answers.length} Questions)</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Preserved snapshot of questions, options, and assigned scores at the exact moment of survey submission.
            </p>
          </div>
        </CardHeader>

        <div className="space-y-4 divide-y divide-slate-100">
          {response.answers.map((ans, idx) => (
            <div key={idx} className="pt-4 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Q{ans.questionNumber}
                    </span>
                    {ans.category && (
                      <span className="text-xs text-slate-400 font-medium">{ans.category}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{ans.questionText}</h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                    +{ans.score} pts
                  </span>
                </div>
              </div>

              {/* Selected Answer Box */}
              <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                <span className="text-xs text-blue-900">
                  <strong className="font-semibold text-blue-950">Selected Answer:</strong>{' '}
                  {ans.selectedOptionText}
                </span>
                <span className="text-xs font-mono text-slate-400">{ans.selectedOptionId}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Response Record"
        message="Are you sure you want to permanently delete this response? This will remove all question snapshots for this user."
        confirmText="Confirm Deletion"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
