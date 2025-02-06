import type React from 'react';
import { CacheProvider } from '@emotion/react';
import { useMemo } from 'react';
import createCache from '@emotion/cache';


export default function EmotionCacheProvider({
  options,
  children,
}: {
  options: Parameters<typeof createCache>[0],
  children: React.ReactNode;
}): React.ReactNode {
  const cache = useMemo(
    () => createCache(options),
    [options]
  );

  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}
