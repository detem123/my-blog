'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroQuote() {
  const [quote, setQuote] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [key, setKey] = useState(0);

  const fetchQuote = async () => {
    try {
      const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=e&c=k');
      const data = await res.json();
      // 截断过长的一言
      const text = data.hitokoto.length > 60 ? data.hitokoto.slice(0, 60) + '...' : data.hitokoto;
      return { text, from: data.from || '未知' };
    } catch {
      const defaults = [
        { text: '凡是过往，皆为序章。', from: '莎士比亚' },
        { text: '千里之行，始于足下。', from: '老子' },
        { text: 'Stay hungry, stay foolish.', from: 'Steve Jobs' },
        { text: '你所热爱的，就是你的生活。', from: '佚名' },
      ];
      return defaults[Math.floor(Math.random() * defaults.length)];
    }
  };

  useEffect(() => {
    fetchQuote().then(q => { setQuote(q.text); setFrom(q.from); });
    const timer = setInterval(async () => {
      const q = await fetchQuote();
      setQuote(q.text); setFrom(q.from); setKey(k => k + 1);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 min-h-[28px]">
      <AnimatePresence mode="wait">
        <motion.p
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-indigo-200/80 dark:text-indigo-300/60 italic"
        >
          「{quote}」<span className="text-xs text-indigo-300/60 ml-2">—— {from}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
