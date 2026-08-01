'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { articleAPI, categoryAPI, tagAPI } from '@/lib/api';
import { SkeletonGrid } from '@/components/SkeletonCard';
import HeroQuote from '@/components/HeroQuote';
import { HiSearch, HiTag, HiCalendar, HiUser } from 'react-icons/hi';

interface Article {
  id: number; title: string; slug: string; summary: string;
  coverImage: string; authorName: string; categoryName: string; tags: string[]; createdAt: string;
}
interface Category { id: number; name: string; }
interface Tag { id: number; name: string; }

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagId, setTagId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || []));
    tagAPI.getAll().then(res => setTags(res.data.data || []));
  }, []);

  useEffect(() => { fetchArticles(); }, [page, categoryId, tagId]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 10 };
      if (categoryId) params.categoryId = categoryId;
      if (tagId) params.tagId = tagId;
      if (keyword) params.keyword = keyword;
      const res = await articleAPI.getList(params);
      const data = res.data.data;
      setArticles(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); fetchArticles(); };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-950 dark:via-violet-950 dark:to-slate-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              用文字，<span className="underline decoration-pink-300 decoration-4 underline-offset-8">书写</span>无限可能
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 dark:text-indigo-200 mb-6 leading-relaxed">
              分享技术洞察、记录生活点滴。InkSpace 是你思想的栖息地。
            </p>
            <HeroQuote />
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path d="M0 30C240 60 480 0 720 30 960 60 1200 0 1440 30v30H0V30Z" className="fill-slate-50 dark:fill-slate-950" />
          </svg>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-6xl mx-auto px-5 -mt-6 relative z-10 mb-10">
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 p-3 flex flex-wrap gap-2 border border-slate-100 dark:border-slate-800"
        >
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3">
            <HiSearch className="text-slate-400 text-lg shrink-0" />
            <input type="text" placeholder="搜索文章..." value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full py-2.5 text-sm focus:outline-none text-slate-700 dark:text-slate-200 bg-transparent" />
          </div>
          <select value={categoryId || ''}
            onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : null); setPage(0); }}
            className="px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <option value="">全部分类</option>
            {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <select value={tagId || ''}
            onChange={e => { setTagId(e.target.value ? Number(e.target.value) : null); setPage(0); }}
            className="px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <option value="">全部标签</option>
            {tags.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
          <button type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900">
            搜索
          </button>
        </motion.form>
      </section>

      {/* Articles Grid */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        {loading ? (
          <SkeletonGrid />
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            <p className="text-4xl mb-3">📭</p><p>暂无文章</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6">
            {articles.map(article => (
              <motion.div key={article.id} variants={item}>
                <Link href={`/article/${article.slug}`} className="block group">
                  <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-full hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-3">
                      {article.categoryName && (
                        <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium px-2.5 py-1 rounded-full">
                          {article.categoryName}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><HiUser className="text-xs" /> {article.authorName}</span>
                      <span className="flex items-center gap-1"><HiCalendar className="text-xs" /> {new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {article.summary || '暂无摘要'}
                    </p>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {article.tags.map((t, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                            <HiTag className="text-[10px]" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium text-slate-600 dark:text-slate-400">← 上一页</button>
            <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="px-5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium text-slate-600 dark:text-slate-400">下一页 →</button>
          </div>
        )}
      </section>
    </div>
  );
}
