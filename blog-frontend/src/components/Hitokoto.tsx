'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Quote {
  hitokoto: string;
  from: string;
  from_who: string | null;
}

export default function Hitokoto() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h&c=i&c=j&c=k&c=l');
      const data = await res.json();
      setQuote(data);
    } catch {
      setQuote({ hitokoto: '愿你以渺小启程，以伟大结束。', from: 'Agust D', from_who: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuote(); }, []);

  return (
    <div className="text-center py-2">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-sm text-slate-300 dark:text-slate-600">加载一言...</motion.p>
        ) : (
          <motion.div key="quote" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
              「{quote?.hitokoto}」
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              —— {quote?.from_who ? `${quote.from_who} · ` : ''}{quote?.from || '未知'}
            </p>
            <button
              onClick={fetchQuote}
              className="text-xs text-indigo-400 hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400 mt-1 transition-colors"
            >
              换一句
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
