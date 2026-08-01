'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-slate-100 dark:border-slate-800'
          : 'bg-white dark:bg-slate-950 border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">✍️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            InkSpace
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            首页
          </Link>

          {user ? (
            <>
              <Link href="/admin" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                管理
              </Link>
              <Link href="/admin/write" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                写文章
              </Link>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {user.username}
              </span>
              <button onClick={logout} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                退出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                登录
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900 hover:-translate-y-0.5"
              >
                注册
              </Link>
            </>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="切换主题"
          >
            {theme === 'dark' ? <HiSun className="text-lg" /> : <HiMoon className="text-lg" />}
          </button>
        </div>

        <button className="md:hidden text-2xl text-slate-600 dark:text-slate-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-3">
          <Link href="/" className="block text-slate-600 dark:text-slate-400 py-1" onClick={() => setMobileOpen(false)}>首页</Link>
          {user ? (
            <>
              <Link href="/admin" className="block text-slate-600 dark:text-slate-400 py-1" onClick={() => setMobileOpen(false)}>管理</Link>
              <Link href="/admin/write" className="block text-slate-600 dark:text-slate-400 py-1" onClick={() => setMobileOpen(false)}>写文章</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block text-red-500 py-1">退出</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-slate-600 dark:text-slate-400 py-1" onClick={() => setMobileOpen(false)}>登录</Link>
              <Link href="/register" className="block text-indigo-600 py-1 font-medium" onClick={() => setMobileOpen(false)}>注册</Link>
            </>
          )}
          <button onClick={toggleTheme} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-1">
            {theme === 'dark' ? <HiSun /> : <HiMoon />} {theme === 'dark' ? '亮色模式' : '深色模式'}
          </button>
        </div>
      )}
    </nav>
  );
}
