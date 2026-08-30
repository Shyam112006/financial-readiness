'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  const isLoginPage = pathname === '/admin/login';

  // Check auth session
  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();

        if (res.ok && data.success) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-medium text-slate-400">Authenticating admin session...</p>
      </div>
    );
  }

  // Derive page titles
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/admin/dashboard': {
      title: 'Dashboard Overview',
      subtitle: 'Key survey metrics, real-time responses, and performance trends',
    },
    '/admin/responses': {
      title: 'Survey Responses',
      subtitle: 'Manage, search, inspect, and export all respondent submissions',
    },
    '/admin/questions': {
      title: 'Question Management',
      subtitle: 'Create, edit question prompts, customize option scores, and reorder',
    },
    '/admin/analytics': {
      title: 'Analytics & Insights',
      subtitle: 'Comprehensive score distributions and question-by-question breakdown',
    },
    '/admin/settings': {
      title: 'Platform Settings',
      subtitle: 'Email delivery status, scoring engine configuration, and admin details',
    },
  };

  const currentMeta = pageTitles[pathname] || {
    title: 'Admin Control Center',
    subtitle: 'Manage your survey platform',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminNavbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          adminName={adminUser?.name || 'Administrator'}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
