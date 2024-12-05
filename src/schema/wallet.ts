import type { Info } from '@/types/Info';
import type { ResolvedFeatures, WalletFeatures } from './features';
import type { Variant } from './variants';

/**
 * The interface used to describe wallets.
 */
export interface Wallet {
  /** Wallet metadata (name, URL, icon, etc.) */
  info: Info;

  /** Set of variants for which the wallet has an implementation. */
  variants: Record<Variant, boolean>;

  /** All wallet features. */
  features: WalletFeatures;
}

export interface ResolvedWallet {
  /** Wallet metadata (name, URL, icon, etc.) */
  info: Info;

  /** The variant for which all features were resolved to. */
  variant: Variant;

  /** All wallet features. */
  features: ResolvedFeatures;
}
