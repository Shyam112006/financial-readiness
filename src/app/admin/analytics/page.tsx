'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  Users,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatCard } from '@/components/admin/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface QuestionStatOption {
  optionId: string;
  optionLetter: string;
  optionText: string;
  score: number;
  count: number;
  percentage: number;
  formatted: string;
}

interface QuestionAnalyticsData {
  questionId: string;
  questionNumber: number;
  questionText: string;
  category: string;
  totalResponses: number;
  options: QuestionStatOption[];
}

interface OverallAnalyticsData {
  metrics: {
    totalResponses: number;
    averageIndex: number;
    averageScore: number;
    medianScore: number;
    highestIndex: number;
    lowestIndex: number;
    totalQuestions: number;
  };
  scoreDistribution: Array<{ range: string; count: number }>;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function AdminAnalyticsPage() {
  const [overall, setOverall] = useState<OverallAnalyticsData | null>(null);
  const [selectedQuestionNumber, setSelectedQuestionNumber] = useState<number>(1);
  const [questionData, setQuestionData] = useState<QuestionAnalyticsData | null>(null);
  const [isLoadingOverall, setIsLoadingOverall] = useState<boolean>(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);

  // Fetch overall analytics
  useEffect(() => {
    async function loadOverall() {
      try {
        setIsLoadingOverall(true);
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (res.ok && data.success) {
          setOverall(data.data);
        }
      } catch (err) {
        console.error('Error loading overall analytics:', err);
      } finally {
        setIsLoadingOverall(false);
      }
    }
    loadOverall();
  }, []);

  // Fetch single question breakdown
  useEffect(() => {
    async function loadQuestionBreakdown() {
      try {
        setIsLoadingQuestion(true);
        const res = await fetch(`/api/admin/analytics/question/${selectedQuestionNumber}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setQuestionData(data.data);
        }
      } catch (err) {
        console.error('Error loading question breakdown:', err);
      } finally {
        setIsLoadingQuestion(false);
      }
    }
    loadQuestionBreakdown();
  }, [selectedQuestionNumber]);

  if (isLoadingOverall) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Compiling multi-dimensional analytics...</p>
      </div>
    );
  }

  const metrics = overall?.metrics || {
    totalResponses: 0,
    averageIndex: 0,
    averageScore: 0,
    medianScore: 0,
    highestIndex: 0,
    lowestIndex: 0,
    totalQuestions: 25,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Overview Statistics Cards */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Statistical Benchmarks</h2>
          <p className="text-xs text-slate-500">Aggregate scoring and participant statistics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Respondents"
            value={metrics.totalResponses}
            icon={Users}
            color="blue"
            subtitle="Completed surveys"
          />
          <StatCard
            title="Average Score"
            value={metrics.averageScore}
            icon={TrendingUp}
            color="emerald"
            subtitle={`Index Avg: ${metrics.averageIndex}`}
          />
          <StatCard
            title="Median Score"
            value={metrics.medianScore}
            icon={BarChart3}
            color="purple"
            subtitle="50th percentile"
          />
          <StatCard
            title="Minimum Score"
            value={metrics.lowestIndex}
            icon={Award}
            color="rose"
            subtitle="Lowest recorded"
          />
          <StatCard
            title="Maximum Score"
            value={metrics.highestIndex}
            icon={Award}
            color="amber"
            subtitle="Highest recorded"
          />
        </div>
      </div>

      {/* Question-Wise Deep Dive Analysis Section */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Deep Dive
                </span>
                <CardTitle>Question-Wise Option Breakdown</CardTitle>
              </div>
              <CardDescription>
                Select any question to analyze response distributions, counts, and option percentages.
              </CardDescription>
            </div>

            {/* Question Selector Dropdown / Pills */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 shrink-0">
                Select Question:
              </label>
              <select
                value={selectedQuestionNumber}
                onChange={(e) => setSelectedQuestionNumber(parseInt(e.target.value, 10))}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {Array.from({ length: metrics.totalQuestions || 25 }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      Question #{num}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </CardHeader>

        {isLoadingQuestion ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <span className="text-xs">Loading Question #{selectedQuestionNumber} statistics...</span>
          </div>
        ) : questionData ? (
          <div className="pt-4 space-y-6">
            {/* Question Prompt Header */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  Q{questionData.questionNumber}
                </span>
                <span className="text-xs text-slate-500 font-medium">{questionData.category}</span>
                <span className="text-xs text-slate-400 ml-auto font-semibold">
                  {questionData.totalResponses} Total Responses
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {questionData.questionText}
              </h3>
            </div>

            {/* Option Distribution Bars & Percentages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Progress Bars & Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Option Response Counts & Percentages
                </h4>

                {questionData.options.map((opt, idx) => (
                  <div
                    key={opt.optionId || idx}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="w-5 h-5 rounded-md text-white font-bold text-xs flex items-center justify-center shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        >
                          {opt.optionLetter}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {opt.optionText}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">{opt.count} responses</span>
                        <span className="text-slate-400 ml-1.5 font-medium">({opt.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${opt.percentage}%`,
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Assigned Weight: {opt.score} pts</span>
                      <span className="font-mono text-slate-500">{opt.formatted}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Pie Chart Visualization */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 self-start">
                  Distribution Pie Chart
                </h4>
                <div className="w-full h-64">
                  {questionData.totalResponses > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={questionData.options}
                          dataKey="count"
                          nameKey="optionText"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {questionData.options.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '12px',
                            border: 'none',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                          formatter={(value, entry, index) => {
                            const opt = questionData.options[index];
                            return `${opt?.optionLetter}: ${opt?.optionText} (${opt?.percentage}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No response data for this question yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Question statistics could not be loaded.
          </div>
        )}
      </Card>

      {/* Global Score Distribution Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Global Index Distribution Histogram</CardTitle>
            <CardDescription>Grouped frequency of calculated index ratings across all respondents</CardDescription>
          </div>
        </CardHeader>
        <div className="h-72 w-full pt-2">
          {overall?.scoreDistribution && overall.scoreDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overall.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Respondent Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No index score distribution data available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
