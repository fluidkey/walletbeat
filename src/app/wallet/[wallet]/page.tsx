import { IsValidWalletName, ratedWallets, wallets } from '@/data/wallets';
import { nonEmptyKeys, nonEmptyMap } from '@/types/utils/non-empty';
import { WalletPage } from '@/components/ui/pages/WalletPage';
import '../../global.css';
import type React from 'react';
import type { Metadata } from 'next';
import { generateBasicMetadata } from '@/components/metadata';
import { betaImagesRoot, betaSiteRoot } from '@/constants';

interface WalletUrlParams {
  wallet: string;
}

export function generateStaticParams(): WalletUrlParams[] {
  return nonEmptyMap(
    nonEmptyKeys(wallets),
    (walletName: string): WalletUrlParams => ({
      wallet: walletName,
    })
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<WalletUrlParams>;
}): Promise<Metadata> {
  const walletName = (await params).wallet;
  if (!IsValidWalletName(walletName)) {
    return generateBasicMetadata({
      title: '404',
      route: `${betaSiteRoot}/404`,
    });
  }
  const walletMetadata = ratedWallets[walletName].metadata;
  return generateBasicMetadata({
    title: `${walletMetadata.displayName} - Walletbeat`,
    description: `How does ${walletMetadata.displayName} stack up as an Ethereum wallet?`,
    route: `${betaSiteRoot}/wallet/${walletMetadata.id}`,
    mainIcon: {
      url: `${betaImagesRoot}/wallets/${walletMetadata.id}.${walletMetadata.iconExtension}`,
    },
    favIcon: `${betaImagesRoot}/wallets/${walletMetadata.id}.${walletMetadata.iconExtension}`,
    keywordsBefore: [
      walletName,
      walletMetadata.displayName,
      `${walletMetadata.id} wallet`,
      `${walletMetadata.displayName} wallet`,
      'wallet',
    ],
    keywordsAfter: ['ranking', 'reviews', 'security', 'privacy'],
  });
}

export default async function Page({
  params,
}: {
  params: Promise<WalletUrlParams>;
}): Promise<React.JSX.Element> {
  const walletName = (await params).wallet;
  if (!IsValidWalletName(walletName)) {
    return <div>Invalid wallet name!</div>;
  }
  return <WalletPage walletName={walletName} />;
}
