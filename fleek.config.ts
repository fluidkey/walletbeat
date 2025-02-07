import { FleekConfig } from '@fleek-platform/cli';

export default {
  sites: [
    {
      slug: 'walletbeat-beta',
      distDir: 'dist',
      buildCommand: 'pnpm install && pnpm build',
    },
  ],
} satisfies FleekConfig;
