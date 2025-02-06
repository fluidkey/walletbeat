import { getBaseUrl } from '@/base-url';
import type { Metadata } from 'next';
import type { IconDescriptor } from 'next/dist/lib/metadata/types/metadata-types';

const siteName = 'Walletbeat';
const siteDescription =
  'Walletbeat is an Ethereum wallet rating site. It aims to provide a trustworthy, up-to-date source of information about the state of the Ethereum wallet ecosystem';
const defaultKeywords = ['walletbeat', 'ethereum', 'wallet', 'wallets', 'wallet beat', 'evm'];
const defaultFavicon: IconDescriptor = {
  url: '/images/favicon.ico',
  sizes: '16x16',
};
const defaultMainIcon: IconDescriptor = {
  url: '/images/icon.jpg',
};
const locale = 'en-US';

export function generateBasicMetadata({
  title,
  route,
  description = undefined,
  mainIcon = undefined,
  favIcon = undefined,
  keywordsBefore = undefined,
  keywordsAfter = undefined,
}: {
  title: string;
  route: string;
  mainIcon?: IconDescriptor;
  favIcon?: string;
  description?: string;
  keywordsBefore?: string[];
  keywordsAfter?: string[];
}): Metadata {
  let favIconDescriptor = defaultFavicon;
  if (favIcon !== undefined) {
    favIconDescriptor = { ...defaultFavicon, url: favIcon };
  }
  const mainIconDescriptor = mainIcon ?? defaultMainIcon;
  const urlRoot = getBaseUrl();
  return {
    title,
    applicationName: siteName,
    description: description ?? siteDescription,
    keywords: (keywordsBefore ?? []).concat(defaultKeywords).concat(keywordsAfter ?? []),
    icons: [favIconDescriptor, mainIconDescriptor],
    openGraph: {
      type: 'website',
      determiner: '',
      url: `${urlRoot}${route}`,
      title,
      description: description ?? siteDescription,
      siteName,
      locale,
      images: {
        url: `${urlRoot}${mainIconDescriptor.url}`,
        secureUrl: `${urlRoot}${mainIconDescriptor.url}`,
        alt: title,
      },
    },
  };
}
