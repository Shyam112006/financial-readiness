'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  Calculator,
  ShieldCheck,
  Server,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [adminProfile, setAdminProfile] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (res.ok && data.success) {
          setAdminProfile(data.user);
        }
      } catch {
        // ignore
      }
    }
    loadAdmin();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Configuration</h2>
        <p className="text-xs text-slate-500">System settings, scoring formula specifications, and email integration</p>
      </div>

      {/* Admin User Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Authenticated Admin</CardTitle>
              <CardDescription>Current administrative session details</CardDescription>
            </div>
          </div>
          <Badge variant="success">Active Session</Badge>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">Admin Name</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{adminProfile?.name || 'System Admin'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">Email Address</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">{adminProfile?.email || 'admin@example.com'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">Role & Permissions</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 capitalize">{adminProfile?.role || 'Administrator'}</p>
          </div>
        </div>
      </Card>

      {/* Email / Brevo Integration Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Email Delivery Configuration (Brevo / Sendinblue / SMTP)</CardTitle>
              <CardDescription>Automated assessment report email dispatcher settings</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900">How to configure Brevo Transactional Email:</h4>
            <p className="text-slate-600 leading-relaxed">
              Emails can be sent via either the <strong>Brevo REST API v3</strong> or via <strong>Brevo SMTP Relay</strong>. Set the corresponding variables in your <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">.env.local</code> file:
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
              <p className="text-emerald-400"># Option 1: Brevo REST API v3 (Recommended - fast &amp; direct)</p>
              <p>BREVO_API_KEY=xkeysib-your_brevo_api_key_here</p>
              <br />
              <p className="text-emerald-400"># Option 2: Brevo SMTP Relay or Custom SMTP</p>
              <p>SMTP_HOST=smtp-relay.brevo.com</p>
              <p>SMTP_PORT=587</p>
              <p>SMTP_USER=your_brevo_account_email</p>
              <p>SMTP_PASSWORD=your_brevo_smtp_key</p>
              <p>SMTP_SECURE=false</p>
              <p>SMTP_FROM=&quot;PulseIndex Assessment &lt;results@yourdomain.com&gt;&quot;</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
              <strong>Fail-Safe Resilience:</strong> If credentials are missing or email sending fails, survey responses are <em>always safely saved</em> in MongoDB with <code className="bg-blue-100 px-1 rounded">emailSent: false</code>, and can be resent anytime from the Responses table.
            </div>
          </div>
        </div>
      </Card>

      {/* Scoring Engine Specification */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Scoring Engine Architecture</CardTitle>
              <CardDescription>Pluggable scoring formulas and index computation strategies</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Active Formula:</span>
              <Badge variant="purple">SimpleSumCalculator (Index = &Sigma; Scores)</Badge>
            </div>

            <p className="text-slate-600 leading-relaxed">
              The scoring calculation is modularized in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">src/lib/scoring.ts</code>. You can easily switch formulas, add question weight multipliers, or compute sub-indices per category without altering the frontend or database schemas.
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
              <p className="text-slate-400">// Interface in src/lib/scoring.ts</p>
              <p className="text-purple-300">export interface ScoreCalculator &#123;</p>
              <p className="pl-4">name: string;</p>
              <p className="pl-4">calculate(answers: AnswerForScoring[]): ScoreCalculationResult;</p>
              <p className="text-purple-300">&#125;</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
