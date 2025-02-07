// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
  ],
  vite: {
    ssr: {
      noExternal: [
        '@mui/*',
      ],
      external: [
        '@mui/x-internals',
      ],
    },
  },
});
