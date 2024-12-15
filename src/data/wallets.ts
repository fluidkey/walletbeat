import { type RatedWallet, rateWallet, type Wallet } from '@/schema/wallet';
import { rabbyBeta } from './wallets/rabby';
import { daimoBeta } from './wallets/daimo';

export const wallets: Record<string, Wallet> = {
  daimoBeta,
  rabbyBeta,
};

export const ratedWallets: Record<string, RatedWallet> = Object.fromEntries(
  Object.entries(wallets).map(([name, wallet]) => [name, rateWallet(wallet)])
);
