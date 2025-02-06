import { FleekConfig } from '@fleek-platform/cli';

export default {
  sites: [
    {
      slug: 'walletbeat-beta',
      distDir: 'out',
      buildCommand: 'npm install && npm run build',
    },
  ],
} satisfies FleekConfig;
