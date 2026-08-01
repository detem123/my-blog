'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { HiPencil, HiCollection, HiHome } from 'react-icons/hi';

const cards = [
  { href: '/admin/write', icon: HiPencil, label: '写文章', desc: 'Markdown 编辑器创作新文章', color: 'from-indigo-500 to-blue-500' },
  { href: '/admin/articles', icon: HiCollection, label: '文章管理', desc: '管理已发布文章和草稿', color: 'from-violet-500 to-purple-500' },
  { href: '/', icon: HiHome, label: '返回首页', desc: '浏览博客前台', color: 'from-emerald-500 to-teal-500' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">欢迎回来，{user?.username} 👋</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">开始管理你的博客内容</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <motion.div key={card.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link href={card.href} className="block group">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <card.icon />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{card.label}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">{card.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
