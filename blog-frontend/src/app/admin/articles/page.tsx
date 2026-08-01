'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { articleAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';

interface Article {
  id: number;
  title: string;
  slug: string;
  status: string;
  categoryName: string;
  createdAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArticles(); }, [page]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await articleAPI.getMyList({ page, size: 10 });
      const data = res.data.data;
      setArticles(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('加载失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try { await articleAPI.delete(id); toast.success('已删除'); setArticles(prev => prev.filter(a => a.id !== id)); }
    catch (err: any) { toast.error(err.response?.data?.message || '删除失败'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">文章管理</h1>
        <Link href="/admin/write"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
          <HiPlus className="text-lg" /> 写新文章
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-400 mb-4">还没有文章</p>
          <Link href="/admin/write" className="text-indigo-600 font-medium hover:underline">去写第一篇 →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50 text-left text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">标题</th>
                  <th className="px-6 py-4 font-medium w-24">状态</th>
                  <th className="px-6 py-4 font-medium w-28">分类</th>
                  <th className="px-6 py-4 font-medium w-32">创建时间</th>
                  <th className="px-6 py-4 font-medium w-36">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {articles.map(article => (
                  <tr key={article.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700 line-clamp-1">{article.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        article.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{article.categoryName || '-'}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{new Date(article.createdAt).toLocaleDateString('zh-CN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Link href={`/article/${article.slug}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="查看">
                          <HiEye />
                        </Link>
                        <Link href={`/admin/write?id=${article.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="编辑">
                          <HiPencil />
                        </Link>
                        <button onClick={() => handleDelete(article.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="删除">
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 text-sm text-slate-600 transition">← 上一页</button>
          <span className="text-sm text-slate-400">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 text-sm text-slate-600 transition">下一页 →</button>
        </div>
      )}
    </motion.div>
  );
}
