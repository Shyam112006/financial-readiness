'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  HelpCircle,
  BarChart3,
  Download,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Responses',
      href: '/admin/responses',
      icon: ClipboardList,
    },
    {
      name: 'Questions',
      href: '/admin/questions',
      icon: HelpCircle,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Export CSV',
      href: '/api/admin/export',
      icon: Download,
      isExternal: true,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#0f1e3a] text-[#bcccdc] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-[#243b53] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-[#243b53]">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-white/20 flex items-center justify-center">
              <Image
                src="/Logo-ShreeCapital.png"
                alt="Shree Capital logo"
                width={140}
                height={50}
                priority
                className="h-6 w-auto object-contain"
              />
              <span className="sr-only">Shree Capital</span>
            </div>
            <span className="text-[11px] font-medium text-[#c9a44c] bg-[#102a43] px-2 py-0.5 rounded-full border border-[#243b53]">
              Advisor
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9fb3c8] hover:text-white hover:bg-[#102a43] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href) && !item.isExternal);

            if (item.isExternal) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  download
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#9fb3c8] hover:text-white hover:bg-[#102a43]"
                >
                  <Icon className="w-5 h-5 text-[#9fb3c8]" />
                  <span>{item.name}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#c9a44c] text-[#0f1e3a] font-semibold shadow-xs'
                    : 'text-[#9fb3c8] hover:text-white hover:bg-[#102a43]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0f1e3a]' : 'text-[#9fb3c8]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
