'use client';
import type React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import NextAppDirEmotionCacheProvider from '@/components/ThemeRegistry/EmotionCache';

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
