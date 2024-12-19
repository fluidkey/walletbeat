import type { DataCollection } from './features/privacy/data-collection';
import type { License } from './features/license';
import {
  type ResolvedFeature,
  resolveFeature,
  type Variant,
  type VariantFeature,
} from './variants';
import type { Monetization } from './features/monetization';
import type { WithRef } from './reference';

/**
 * A set of features about a wallet, each of which may or may not depend on
 * the wallet variant.
 */
export interface WalletFeatures {
  /** Privacy features. */
  privacy: {
    /** Data collection information. */
    dataCollection: VariantFeature<WithRef<DataCollection>>;

    /** Privacy policy URL of the wallet. */
    privacyPolicy: VariantFeature<string>;
  };

  /**
   * Whether the wallet supports multiple addresses.
   * A single seed phrase still counts as multiple addresses.
   */
  multiAddress: VariantFeature<boolean>;

  /** License of the wallet. */
  license: VariantFeature<WithRef<License>>;

  /** The monetization model of the wallet. */
  monetization: VariantFeature<Monetization>;
}

/**
 * A set of features about a specific wallet variant.
 * All features are resolved to a single variant here.
 */
export interface ResolvedFeatures {
  /** The wallet variant which was used to resolve the feature tree. */
  variant: Variant;

  privacy: {
    dataCollection: ResolvedFeature<DataCollection>;
    privacyPolicy: ResolvedFeature<string>;
  };
  multiAddress: ResolvedFeature<boolean>;
  license: ResolvedFeature<License>;
  monetization: ResolvedFeature<Monetization>;
}

/** Resolve a set of features according to the given variant. */
export function resolveFeatures(features: WalletFeatures, variant: Variant): ResolvedFeatures {
  const feat = <F>(feature: VariantFeature<F>): ResolvedFeature<F> =>
    resolveFeature<F>(feature, variant);
  return {
    variant,
    privacy: {
      dataCollection: feat(features.privacy.dataCollection),
      privacyPolicy: feat(features.privacy.privacyPolicy),
    },
    multiAddress: feat(features.multiAddress),
    license: feat(features.license),
    monetization: feat(features.monetization),
  };
}
