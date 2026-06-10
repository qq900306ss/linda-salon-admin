import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import './globals.css';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Linda Salon 管理後台',
  description: 'Linda Salon 美髮沙龍管理系統',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={notoSansTC.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
