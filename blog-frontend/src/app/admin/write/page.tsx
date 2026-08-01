'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { articleAPI, categoryAPI, tagAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiSave, HiPaperAirplane, HiX } from 'react-icons/hi';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('DRAFT');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || []));
    if (editId) {
      articleAPI.getBySlug(editId).then(res => {
        const a = res.data.data;
        setTitle(a.title || ''); setContent(a.content || ''); setSummary(a.summary || '');
        setCategoryName(a.categoryName || ''); setTags(a.tags || []); setStatus(a.status || 'DRAFT');
      }).catch(() => toast.error('加载文章失败'));
    }
  }, [editId]);

  const addTag = () => {
    const name = tagInput.trim();
    if (name && !tags.includes(name)) setTags(prev => [...prev, name]);
    setTagInput('');
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !content.trim()) { toast.error('标题和内容不能为空'); return; }
    setSaving(true);
    try {
      const data = {
        title: title.trim(), content,
        summary: summary.trim() || content.substring(0, 200),
        categoryName: categoryName || null,
        tags: tags.length > 0 ? tags : null,
        status: publish ? 'PUBLISHED' : 'DRAFT',
      };
      if (editId) { await articleAPI.update(Number(editId), data); toast.success('更新成功'); }
      else { await articleAPI.create(data); toast.success(publish ? '发布成功！' : '草稿已保存'); }
      router.push('/admin/articles');
    } catch (err: any) { toast.error(err.response?.data?.message || '保存失败'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{editId ? '编辑文章' : '写文章'}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        {/* Title */}
        <input
          type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="文章标题..."
          className="w-full text-2xl font-bold px-0 py-2 border-0 border-b-2 border-slate-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-300 transition-colors"
        />

        {/* Summary */}
        <input
          type="text" value={summary} onChange={e => setSummary(e.target.value)}
          placeholder="文章摘要（选填）"
          className="w-full px-0 py-2 border-0 border-b border-slate-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-300 text-sm transition-colors"
        />

        {/* Category + Tags */}
        <div className="flex gap-3 items-center flex-wrap">
          <select value={categoryName} onChange={e => setCategoryName(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-600">
            <option value="">选择分类</option>
            {categories.map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>

          <div className="flex-1 flex gap-2 flex-wrap items-center">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-xs font-medium">
                {tag}
                <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-500"><HiX /></button>
              </span>
            ))}
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="+ 标签" className="w-20 px-2 py-1 border-0 text-xs focus:outline-none" />
            <button type="button" onClick={addTag} className="text-xs text-indigo-500 hover:underline">添加</button>
          </div>
        </div>

        {/* MD Editor */}
        <div data-color-mode="light">
          <MDEditor value={content} onChange={val => setContent(val || '')} height={520} preview="live" />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition">
            <HiSave /> 保存草稿
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200">
            <HiPaperAirplane /> {saving ? '发布中...' : '发布'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
