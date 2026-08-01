'use client';

import { useState } from 'react';
import Hitokoto from './Hitokoto';
import ProgressBar from './ProgressBar';
import LiveClock from './LiveClock';

export default function Footer() {
  const [showStats, setShowStats] = useState(false);

  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Logo + 一言 */}
          <div>
            <div className="text-center md:text-left mb-3">
              <span className="text-2xl">✍️</span>
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                InkSpace
              </span>
            </div>
            <Hitokoto />
          </div>

          {/* 时钟 */}
          <div className="flex justify-center">
            <LiveClock />
          </div>

          {/* 进度条 */}
          <div className="flex justify-center md:justify-end">
            <div>
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors mb-3 block mx-auto"
              >
                {showStats ? '收起统计 ▲' : '时光统计 ▼'}
              </button>
              {showStats && <ProgressBar />}
              {!showStats && (
                <p className="text-center text-xs text-slate-300 dark:text-slate-600">
                  © {new Date().getFullYear()} · Built with Next.js & Spring Boot
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
