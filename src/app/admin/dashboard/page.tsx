'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  MailCheck,
  HelpCircle,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  metrics: {
    totalResponses: number;
    responsesToday: number;
    responsesThisWeek: number;
    averageIndex: number;
    averageScore: number;
    medianScore: number;
    highestIndex: number;
    lowestIndex: number;
    emailSentCount: number;
    emailDeliveryRate: number;
    totalQuestions: number;
  };
  scoreDistribution: Array<{ range: string; count: number }>;
  timeline: Array<{ date: string; label: string; responses: number; averageIndex: number }>;
  recentResponses: Array<{
    _id: string;
    respondent: { name: string; email: string };
    totalScore: number;
    indexValue: number;
    submittedAt: string;
    emailSent: boolean;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setIsRefreshing(true);
      else setIsLoading(true);

      const res = await fetch('/api/admin/analytics');
      const result = await res.json();

      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading dashboard analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalResponses: 0,
    responsesToday: 0,
    responsesThisWeek: 0,
    averageIndex: 0,
    averageScore: 0,
    medianScore: 0,
    highestIndex: 0,
    lowestIndex: 0,
    emailSentCount: 0,
    emailDeliveryRate: 0,
    totalQuestions: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time telemetry and respondent assessment trends</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>

          <a href="/api/admin/export" download>
            <Button variant="primary" size="sm" leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Download CSV
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Responses"
          value={metrics.totalResponses}
          icon={Users}
          color="blue"
          subtitle={`${metrics.responsesToday} today`}
        />
        <StatCard
          title="Responses This Week"
          value={metrics.responsesThisWeek}
          icon={Calendar}
          color="purple"
          subtitle="Past 7 days"
        />
        <StatCard
          title="Average Index"
          value={metrics.averageIndex}
          icon={TrendingUp}
          color="emerald"
          subtitle={`Median: ${metrics.medianScore}`}
        />
        <StatCard
          title="Highest Index"
          value={metrics.highestIndex}
          icon={Award}
          color="amber"
          subtitle="Peak response"
        />
        <StatCard
          title="Lowest Index"
          value={metrics.lowestIndex}
          icon={Award}
          color="rose"
          subtitle="Floor response"
        />
        <StatCard
          title="Email Delivery"
          value={`${metrics.emailDeliveryRate}%`}
          icon={MailCheck}
          color="slate"
          subtitle={`${metrics.emailSentCount} delivered`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Response Activity (Last 14 Days)</CardTitle>
              <CardDescription>Daily respondent completion volume</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            {data?.timeline && data.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorResponses)"
                    name="Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity records available
              </div>
            )}
          </div>
        </Card>

        {/* Score Distribution Histogram */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Calculated Index Distribution</CardTitle>
              <CardDescription>Frequency histogram of respondent index scores</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            {data?.scoreDistribution && data.scoreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Respondents" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No score records available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Responses Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest completed surveys with calculated indices</CardDescription>
          </div>
          <Link href="/admin/responses">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              View All Responses
            </Button>
          </Link>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4">Respondent</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Index</th>
                <th className="py-3 px-4 text-center">Email Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data?.recentResponses && data.recentResponses.length > 0 ? (
                data.recentResponses.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.respondent.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{item.respondent.email}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(item.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{item.totalScore}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {item.indexValue}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={item.emailSent ? 'success' : 'warning'}>
                        {item.emailSent ? 'Delivered' : 'Pending/Failed'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/responses/${item._id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No survey responses recorded yet. Take a survey to see data appear here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
