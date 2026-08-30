'use client';

import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
  adminName?: string;
}

export function AdminNavbar({
  onToggleSidebar,
  title,
  subtitle,
  adminName = 'Administrator',
}: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium text-slate-700">{adminName}</span>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
