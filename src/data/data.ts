import { type Info } from '@/types/Info';
import { metamask } from './wallets/metamask';
import { uniswap } from './wallets/uniswap';
import { coinbase } from './wallets/coinbase';
import { rainbow } from './wallets/rainbow';
import { safe } from './wallets/safe';
import { den } from './wallets/den';
import { obvious } from './wallets/obvious';
import { zerion } from './wallets/zerion';
import { tokenary } from './wallets/tokenary';
import { ambire } from './wallets/ambire';
import { trustwallet } from './wallets/trustwallet';
import { mathwallet } from './wallets/mathwallet';
import { exodus } from './wallets/exodus';
import { tokenpocket } from './wallets/tokenpocket';
import { gemwallet } from './wallets/gemwallet';

export const wallets: Record<string, Info> = {
  Metamask: metamask,
  'Uniswap Wallet': uniswap,
  'Coinbase Wallet': coinbase,
  Rainbow: rainbow,
  'Safe Wallet': safe,
  Den: den,
  Obvious: obvious,
  Zerion: zerion,
  Tokenary: tokenary,
  'Ambire Wallet': ambire,
  'Trust Wallet': trustwallet,
  'Math Wallet': mathwallet,
  Exodus: exodus,
  TokenPocket: tokenpocket,
  Gemwallet: gemwallet,
};
