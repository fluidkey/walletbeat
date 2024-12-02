import React from 'react';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { Work_Sans } from 'next/font/google';
import PlausibleProvider from 'next-plausible';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `walletbeat`,
};

const workSans = Work_Sans({
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="walletbeat.fyi" />
      </head>
      <body className={workSans.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
