import type { Metadata } from 'next';
import type { Icons } from 'next/dist/lib/metadata/types/metadata-types';

const siteName = 'Walletbeat';
const siteDescription =
  'Walletbeat is an Ethereum wallet rating site. It aims to provide a trustworthy, up-to-date source of information about the state of the Ethereum wallet ecosystem';
const defaultKeywords = ['walletbeat', 'ethereum', 'wallet', 'wallets', 'wallet beat', 'evm'];
const defaultIcons: Icons = {
  icon: [
    {
      url: '/images/beta/favicon.ico',
      sizes: '16x16',
    },
    {
      url: '/images/beta/icon.jpg',
    },
  ],
};
const locale = 'en-US';

export function generateBasicMetadata({
  title,
  route,
  description = undefined,
  icons = undefined,
  keywordsBefore = undefined,
  keywordsAfter = undefined,
}: {
  title: string;
  route: string;
  icons?: Metadata['icons'];
  description?: string;
  keywordsBefore?: string[];
  keywordsAfter?: string[];
}): Metadata {
  return {
    title,
    applicationName: siteName,
    description: description ?? siteDescription,
    keywords: (keywordsBefore ?? []).concat(defaultKeywords).concat(keywordsAfter ?? []),
    icons: icons ?? defaultIcons,
    openGraph: {
      type: 'website',
      determiner: '',
      title,
      description: description ?? siteDescription,
      siteName,
      locale,
    },
  };
}
