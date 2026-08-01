'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error('请填写用户名和密码'); return; }
    setLoading(true);
    try { await login(username, password); toast.success('欢迎回来！'); router.push('/admin'); }
    catch (err: any) { toast.error(err.response?.data?.message || '登录失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">✍️</span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3">欢迎回来</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">登录 InkSpace 继续创作</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="请输入用户名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="请输入密码" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200 dark:shadow-indigo-900">
            {loading ? '登录中...' : '登录'}
          </button>
          <p className="text-center text-sm text-slate-400 dark:text-slate-500">
            还没有账号？<Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-1">立即注册</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
