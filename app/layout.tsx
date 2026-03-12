import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import FloatingFoodBackground from './components/FloatingFoodBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'OnlyFoods - Fresh & Local',
  description: 'The tastiest social network in Pécs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} font-sans min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden`}>
        <FloatingFoodBackground />
        <Header />
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
