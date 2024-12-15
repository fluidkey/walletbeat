import { resolveFeatures, type ResolvedFeatures, type WalletFeatures } from './features';
import { type AtLeastOneVariant, Variant } from './variants';
import { aggregateAttributes, evaluateAttributes, type EvaluationTree } from './attribute-groups';
import { type NonEmptyArray, nonEmptyRemap } from '@/types/utils/non-empty';

/** A contributor to walletbeat. */
export interface Contributor {
  name: string;
  url?: string;
}

/** Basic wallet metadata. */
export interface WalletMetadata {
  /**
   * ID of the wallet.
   * It is expected that a wallet image exists at
   * `/public/images/wallet/${id}.${iconExtension}`.
   */
  id: string;
  displayName: string;
  iconExtension: 'png' | 'svg';
  url: string;
  repoUrl?: string;
  lastUpdated: string;
  contributors: NonEmptyArray<Contributor>;
}

/**
 * The interface used to describe wallets.
 */
export interface Wallet {
  /** Wallet metadata (name, URL, icon, etc.) */
  metadata: WalletMetadata;

  /** Set of variants for which the wallet has an implementation. */
  variants: Record<Variant, boolean>;

  /** All wallet features. */
  features: WalletFeatures;
}

export interface ResolvedWallet {
  /** Wallet metadata (name, URL, icon, etc.) */
  metadata: WalletMetadata;

  /** The variant for which all features were resolved to. */
  variant: Variant;

  /** All wallet features. */
  features: ResolvedFeatures;

  /** Attribute tree for the wallet variant. */
  attributes: EvaluationTree;
}

export interface RatedWallet {
  metadata: WalletMetadata;

  variants: AtLeastOneVariant<ResolvedWallet>;

  overall: EvaluationTree;
}

function resolveVariant(wallet: Wallet, variant: Variant): ResolvedWallet | null {
  if (!wallet.variants[variant]) {
    return null;
  }
  const resolvedFeatures = resolveFeatures(wallet.features, variant);
  return {
    metadata: wallet.metadata,
    variant,
    features: resolvedFeatures,
    attributes: evaluateAttributes(resolvedFeatures),
  };
}

export function rateWallet(wallet: Wallet): RatedWallet {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe because each feature must already have at least one variant populated.
  const perVariantWallets: AtLeastOneVariant<ResolvedWallet> = Object.fromEntries(
    Object.entries({
      browser: resolveVariant(wallet, Variant.BROWSER),
      mobile: resolveVariant(wallet, Variant.MOBILE),
      desktop: resolveVariant(wallet, Variant.DESKTOP),
    }).filter(([_, val]) => val !== null)
  ) as AtLeastOneVariant<ResolvedWallet>;
  const perVariantTree: AtLeastOneVariant<EvaluationTree> = nonEmptyRemap(
    perVariantWallets,
    (_: Variant, wallet: ResolvedWallet) => wallet.attributes
  );
  return {
    metadata: wallet.metadata,
    variants: perVariantWallets,
    overall: aggregateAttributes(perVariantTree),
  };
}
