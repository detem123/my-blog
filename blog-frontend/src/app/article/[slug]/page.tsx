'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { articleAPI, commentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiCalendar, HiTag, HiClock, HiClipboardCheck, HiClipboard } from 'react-icons/hi';

/* ========== 从 markdown 提取标题 ========== */
function extractToc(md: string) {
  const re = /^(#{2,4})\s+(.+)$/gm;
  const items: { level: number; text: string; id: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const text = m[2].trim();
    const id = 'heading-' + encodeURIComponent(text).replace(/%/g, '').toLowerCase();
    items.push({ level: m[1].length, text, id });
  }
  return items;
}

/* ========== 阅读时间 ========== */
function readingTime(md: string) {
  const words = md.replace(/[#*`\[\]()!\-_>|]/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 300));
}

/* ========== 简易 Markdown 渲染 ========== */
function renderMarkdown(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">${lang || 'text'}</span><button class="copy-btn" data-code="${escaped.replace(/"/g, '&quot;')}">📋 复制</button></div><pre><code class="language-${lang || 'text'}">${escaped}</code></pre></div>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#### (.+)$/gm, (_, t) => `<h4 id="heading-${encodeURIComponent(t.trim()).replace(/%/g, '').toLowerCase()}">${t}</h4>`)
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="heading-${encodeURIComponent(t.trim()).replace(/%/g, '').toLowerCase()}">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="heading-${encodeURIComponent(t.trim()).replace(/%/g, '').toLowerCase()}">${t}</h2>`)
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^(?!<[a-z/]|$)(.+)$/gm, '<p>$1</p>')
    .replace(/\n{3,}/g, '\n\n');
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');
  return html;
}

/* ========== 组件 ========== */
interface Article {
  id: number; title: string; content: string; summary: string; coverImage: string;
  authorName: string; categoryName: string; tags: string[]; createdAt: string; updatedAt: string;
}
interface Comment {
  id: number; content: string; authorName: string; createdAt: string; parentId: number | null;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    articleAPI.getBySlug(slug as string)
      .then(res => {
        setArticle(res.data.data);
        return commentAPI.getList(res.data.data.id);
      })
      .then(res => { if (res) setComments(res.data.data || []); })
      .catch(() => toast.error('文章加载失败'))
      .finally(() => setLoading(false));
  }, [slug]);

  /* TOC 滚动高亮 */
  const tocItems = useMemo(() => article ? extractToc(article.content) : [], [article]);

  useEffect(() => {
    if (tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    tocItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocItems, article]);

  /* 代码复制按钮 */
  useEffect(() => {
    if (!contentRef.current) return;
    const onCopy = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.copy-btn') as HTMLButtonElement | null;
      if (!btn) return;
      const code = btn.dataset.code || '';
      navigator.clipboard.writeText(code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
      btn.textContent = '✅ 已复制';
      setTimeout(() => { btn.textContent = '📋 复制'; }, 2000);
    };
    contentRef.current.addEventListener('click', onCopy);
    return () => contentRef.current?.removeEventListener('click', onCopy);
  }, [article]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) { toast.error('请先登录'); return; }
    try {
      const res = await commentAPI.create(article!.id, { content: commentText, parentId: replyTo?.id });
      setComments(prev => [res.data.data, ...prev]);
      setCommentText('');
      setReplyTo(null);
      toast.success('评论成功');
    } catch (err: any) { toast.error(err.response?.data?.message || '评论失败'); }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!article) return <div className="text-center py-32 text-slate-400">文章不存在</div>;

  const topComments = comments.filter(c => !c.parentId);
  const getReplies = (pid: number) => comments.filter(c => c.parentId === pid);
  const readMin = readingTime(article.content);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 flex gap-10 relative">
      {/* ======== 正文 ======== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          {article.categoryName && (
            <span className="inline-block text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full mb-4">
              {article.categoryName}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-5 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><HiUser /> {article.authorName}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><HiCalendar /> {new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><HiClock /> {readMin} 分钟阅读</span>
            {article.tags && article.tags.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md text-xs">
                <HiTag className="text-[10px]" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <article
          ref={contentRef}
          className="markdown-body bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 mb-10"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />

        {/* Comments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
            评论 <span className="text-slate-400 dark:text-slate-500 font-normal">({comments.length})</span>
          </h3>
          <form onSubmit={handleComment} className="mb-8">
            {replyTo && (
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg inline-block">
                回复 <span className="font-medium text-slate-700 dark:text-slate-300">@{replyTo.name}</span>
                <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-indigo-500 hover:text-red-500">取消</button>
              </div>
            )}
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder={user ? '写下你的想法...' : '请先登录后评论'} disabled={!user} rows={3}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm disabled:bg-slate-50 dark:disabled:bg-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" />
            <button type="submit" disabled={!user || !commentText.trim()}
              className="mt-3 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-indigo-200 dark:shadow-indigo-900">
              发表评论
            </button>
          </form>
          <div className="space-y-5">
            {topComments.map(comment => (
              <div key={comment.id} className="border-b border-slate-50 dark:border-slate-800 pb-5 last:border-0">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {comment.authorName[0]?.toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{comment.authorName}</span>
                  <span className="text-slate-400 dark:text-slate-600 text-xs">{new Date(comment.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 ml-10">{comment.content}</p>
                <button onClick={() => setReplyTo({ id: comment.id, name: comment.authorName })}
                  className="ml-10 text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">回复</button>
                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="ml-10 mt-4 pl-5 border-l-2 border-indigo-100 dark:border-indigo-500/20">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{reply.authorName}</span>
                      <span className="text-slate-400 dark:text-slate-600 text-xs">{new Date(reply.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            ))}
            {topComments.length === 0 && <p className="text-slate-400 text-sm text-center py-6">还没有评论，来抢沙发吧 🛋️</p>}
          </div>
        </div>
      </motion.div>

      {/* ======== 右侧 TOC ======== */}
      {tocItems.length > 2 && (
        <>
          {/* Desktop TOC */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">目录</h4>
              <nav className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800">
                {tocItems.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                    className={`toc-link block text-sm py-1 pl-3 border-l-2 -ml-0.5 transition-colors ${
                      activeId === item.id
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-indigo-500'
                        : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile TOC toggle */}
          <div className="lg:hidden fixed bottom-24 right-8 z-40">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-100 dark:border-slate-700"
            >
              📑
            </button>
            {tocOpen && (
              <div className="absolute bottom-14 right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 max-h-80 overflow-y-auto">
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">目录</h4>
                {tocItems.map(item => (
                  <a key={item.id} href={`#${item.id}`}
                    onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); setTocOpen(false); }}
                    className={`block text-sm py-1 transition-colors ${
                      activeId === item.id ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                    style={{ paddingLeft: `${(item.level - 1) * 8}px` }}>
                      {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
