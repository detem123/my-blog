'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { HiPencil, HiCollection, HiHome } from 'react-icons/hi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const tabs = [
    { href: '/admin', label: '仪表盘', icon: HiHome },
    { href: '/admin/write', label: '写文章', icon: HiPencil },
    { href: '/admin/articles', label: '文章管理', icon: HiCollection },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex gap-1 mb-10 bg-white dark:bg-slate-900 rounded-xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 w-fit">
        {tabs.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900'
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              <tab.icon className="text-base" />{tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
