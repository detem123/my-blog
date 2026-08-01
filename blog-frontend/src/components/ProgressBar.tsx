'use client';

import { useEffect, useState } from 'react';

function calcProgress() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // 年进度
  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year + 1, 0, 1).getTime();
  const yearPct = ((now.getTime() - yearStart) / (yearEnd - yearStart)) * 100;

  // 月进度
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 1).getTime();
  const monthPct = ((now.getTime() - monthStart) / (monthEnd - monthStart)) * 100;

  // 日进度
  const dayStart = new Date(year, month, day).getTime();
  const dayEnd = new Date(year, month, day + 1).getTime();
  const dayPct = ((now.getTime() - dayStart) / (dayEnd - dayStart)) * 100;

  return { yearPct, monthPct, dayPct, dayOfYear: Math.ceil((now.getTime() - yearStart) / 86400000) };
}

export default function ProgressBar() {
  const [progress, setProgress] = useState(calcProgress);

  useEffect(() => {
    const timer = setInterval(() => setProgress(calcProgress), 30000);
    return () => clearInterval(timer);
  }, []);

  const items = [
    { label: '今日', pct: progress.dayPct, color: 'bg-emerald-400' },
    { label: '本月', pct: progress.monthPct, color: 'bg-blue-400' },
    { label: '今年', pct: progress.yearPct, color: 'bg-indigo-400' },
  ];

  return (
    <div className="space-y-2 max-w-xs mx-auto">
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3">
        📅 {new Date().getFullYear()} · 第 {progress.dayOfYear} 天
      </p>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 w-8 shrink-0">{item.label}</span>
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-full transition-all duration-[2000ms] ease-out`}
              style={{ width: `${Math.min(item.pct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 w-10 text-right">
            {item.pct.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
