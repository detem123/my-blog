'use client';

import { useEffect, useState } from 'react';

function formatTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;
  return { time: `${hours}:${minutes}:${seconds}`, date: dateStr };
}

export default function LiveClock() {
  const [clock, setClock] = useState(formatTime);

  useEffect(() => {
    const timer = setInterval(() => setClock(formatTime), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <p className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-300 tracking-wider">
        {clock.time}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        {clock.date}
      </p>
    </div>
  );
}
