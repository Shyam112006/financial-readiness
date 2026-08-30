'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';

interface ResponseItem {
  _id: string;
  respondent: {
    name: string;
    email: string;
    age?: number;
  };
  totalScore: number;
  indexValue: number;
  submittedAt: string;
  emailSent: boolean;
  emailSentAt?: string;
  emailError?: string;
}

interface PaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filters & State
  const [search, setSearch] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Actions state
  const [deleteTarget, setDeleteTarget] = useState<ResponseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        search,
        emailStatus,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/responses?${query.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResponses(data.data || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load responses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, emailStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Handle Search Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Toggle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Resend Email Handler
  const handleResendEmail = async (id: string, email: string) => {
    try {
      setResendingId(id);
      const res = await fetch(`/api/admin/responses/${id}/resend-email`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage({ type: 'success', text: `Email dispatched to ${email}` });
        fetchResponses();
      } else {
        setToastMessage({
          type: 'error',
          text: data.message || 'Failed to dispatch email. Check Brevo / SMTP settings.',
        });
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Error dispatching email' });
    } finally {
      setResendingId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const [isResendingAll, setIsResendingAll] = useState<boolean>(false);
  const handleResendAll = async () => {
    try {
      setIsResendingAll(true);
      const res = await fetch('/api/admin/responses/resend-all', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage({ type: 'success', text: data.message });
        fetchResponses();
      } else {
        setToastMessage({
          type: 'error',
          text: data.message || 'Failed to send emails. Check your Brevo API key.',
        });
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Error executing bulk resend' });
    } finally {
      setIsResendingAll(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  // Delete Response Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/responses/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage({ type: 'success', text: 'Survey response removed' });
        setDeleteTarget(null);
        fetchResponses();
      } else {
        setToastMessage({ type: 'error', text: data.message || 'Failed to delete' });
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Server error while deleting response' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-md transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control bar: Search, Filter, Export */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by respondent name or email address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Email filter & export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={emailStatus}
                onChange={(e) => {
                  setEmailStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Email States</option>
                <option value="sent">Delivered Only</option>
                <option value="failed">Failed / Pending Only</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResendAll}
              isLoading={isResendingAll}
              leftIcon={<Mail className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Resend All Pending
            </Button>

            <a href="/api/admin/export" download>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
              >
                Export CSV
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Responses Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80">
                <th
                  onClick={() => handleSort('respondent.name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Respondent</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Age</th>
                <th
                  onClick={() => handleSort('submittedAt')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submission Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalScore')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('indexValue')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Index</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Email Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <span>Fetching response records...</span>
                  </td>
                </tr>
              ) : responses.length > 0 ? (
                responses.map((resp) => (
                  <tr key={resp._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {resp.respondent.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                      {resp.respondent.email}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600 text-xs">
                      {resp.respondent.age ? `${resp.respondent.age} yrs` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(resp.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {resp.totalScore}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs">
                        {resp.indexValue}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={resp.emailSent ? 'success' : 'warning'}>
                        {resp.emailSent ? 'Delivered' : 'Pending/Failed'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/responses/${resp._id}`}>
                          <button
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View full responses snapshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleResendEmail(resp._id, resp.respondent.email)}
                          disabled={resendingId === resp._id}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                          title="Resend result email"
                        >
                          {resendingId === resp._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setDeleteTarget(resp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete response"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No survey responses matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{responses.length}</strong> of{' '}
            <strong className="text-slate-800">{pagination.totalCount}</strong> total respondents
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage || isLoading}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage || isLoading}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Survey Response"
        message={`Are you sure you want to permanently delete the response for "${deleteTarget?.respondent.name}" (${deleteTarget?.respondent.email})? This action cannot be undone.`}
        confirmText="Delete Response"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
