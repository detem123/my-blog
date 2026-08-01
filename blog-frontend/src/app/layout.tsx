import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'InkSpace — 书写无限可能',
  description: '一个简约优雅的个人博客，用文字记录思考与创造。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="text-center text-slate-400 dark:text-slate-600 text-sm py-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
              <p className="text-lg mb-1">✍️</p>
              <p>© {new Date().getFullYear()} InkSpace · Built with Next.js & Spring Boot</p>
            </footer>
            <BackToTop />
          </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}
