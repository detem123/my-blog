'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { articleAPI, commentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiCalendar, HiTag } from 'react-icons/hi';

interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  authorName: string;
  categoryName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
  parentId: number | null;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    articleAPI.getBySlug(slug as string)
      .then(res => {
        const articleData = res.data.data;
        setArticle(articleData);
        return commentAPI.getList(articleData.id);
      })
      .then(res => { if (res) setComments(res.data.data || []); })
      .catch(() => toast.error('文章加载失败'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) { toast.error('请先登录'); return; }
    try {
      const res = await commentAPI.create(article!.id, {
        content: commentText,
        parentId: replyTo?.id,
      });
      setComments(prev => [res.data.data, ...prev]);
      setCommentText('');
      setReplyTo(null);
      toast.success('评论成功');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '评论失败');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!article) return <div className="text-center py-32 text-slate-400">文章不存在</div>;

  const topComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: number) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-10">
          {article.categoryName && (
            <span className="inline-block text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full mb-4">
              {article.categoryName}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1"><HiUser /> {article.authorName}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><HiCalendar /> {new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
            {article.tags && article.tags.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-xs">
                <HiTag className="text-[10px]" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <article
          className="markdown-body bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />

        {/* Comments */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            评论 <span className="text-slate-400 font-normal">({comments.length})</span>
          </h3>

          <form onSubmit={handleComment} className="mb-8">
            {replyTo && (
              <div className="text-sm text-slate-500 mb-2 bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                回复 <span className="font-medium text-slate-700">@{replyTo.name}</span>
                <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-indigo-500 hover:text-red-500">取消</button>
              </div>
            )}
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={user ? '写下你的想法...' : '请先登录后评论'}
              disabled={!user}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={!user || !commentText.trim()}
              className="mt-3 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-indigo-200"
            >
              发表评论
            </button>
          </form>

          <div className="space-y-5">
            {topComments.map(comment => (
              <div key={comment.id} className="border-b border-slate-50 pb-5 last:border-0">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {comment.authorName[0]?.toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-700">{comment.authorName}</span>
                  <span className="text-slate-400 text-xs">
                    {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-2 ml-10">{comment.content}</p>
                <button
                  onClick={() => setReplyTo({ id: comment.id, name: comment.authorName })}
                  className="ml-10 text-xs text-slate-400 hover:text-indigo-600 transition"
                >
                  回复
                </button>

                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="ml-10 mt-4 pl-5 border-l-2 border-indigo-100">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-semibold text-slate-700">{reply.authorName}</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(reply.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            ))}
            {topComments.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-6">还没有评论，来抢沙发吧 🛋️</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')
    .replace(/\n{3,}/g, '\n\n');
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');
  return html;
}
