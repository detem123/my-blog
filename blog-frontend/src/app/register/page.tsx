'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error('请填写必填项'); return; }
    if (username.length < 3) { toast.error('用户名至少3位'); return; }
    if (password.length < 6) { toast.error('密码至少6位'); return; }
    setLoading(true);
    try {
      await register(username, password, email);
      toast.success('注册成功！');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '注册失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🚀</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-3">创建账号</h1>
          <p className="text-slate-400 text-sm mt-1">加入 InkSpace，开始你的创作之旅</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">用户名 <span className="text-red-400">*</span></label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition" placeholder="至少3位" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">密码 <span className="text-red-400">*</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition" placeholder="至少6位" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition" placeholder="选填" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200">
            {loading ? '注册中...' : '注册'}
          </button>
          <p className="text-center text-sm text-slate-400">
            已有账号？<Link href="/login" className="text-indigo-600 hover:underline font-medium ml-1">立即登录</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
