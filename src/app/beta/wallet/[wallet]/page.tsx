import { IsValidWalletName, wallets } from '@/beta/data/wallets';
import { nonEmptyKeys, nonEmptyMap } from '@/beta/types/utils/non-empty';
import { WalletPage } from '@/beta/components/ui/pages/WalletPage';
import '../../global.css';
import type React from 'react';

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

export default function Page({ params }: { params: WalletUrlParams }): React.JSX.Element {
  const walletName = params.wallet;
  if (!IsValidWalletName(walletName)) {
    return <div>Invalid wallet name!</div>;
  }
  return <WalletPage walletName={walletName} />;
}
