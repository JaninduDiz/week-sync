import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'WeekSync',
  description: 'A Progressive Web App for tracking Weekly Tasks and daily tasks with a native iOS-like design.',
  manifest: '/manifest.json',
  icons: { apple: '/icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#E3F2FD',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
