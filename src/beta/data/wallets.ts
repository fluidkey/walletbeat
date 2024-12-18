import { type RatedWallet, rateWallet, type Wallet } from '@/beta/schema/wallet';
import { rabby } from './wallets/rabby';
import { daimo } from './wallets/daimo';

export const wallets: Record<string, Wallet> = {
  daimo,
  rabby,
};

export const ratedWallets: Record<string, RatedWallet> = Object.fromEntries(
  Object.entries(wallets).map(([name, wallet]) => [name, rateWallet(wallet)])
);
