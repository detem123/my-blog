import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';
import Footer from '@/components/Footer';
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
            <Footer />
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
