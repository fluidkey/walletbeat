import type { DataCollection } from './features/privacy/data-collection';
import type { License } from './features/license';
import {
  type ResolvedFeature,
  ResolveFeature,
  type Variant,
  type VariantFeature,
} from './variants';

/**
 * A set of features about a wallet, each of which may or may not depend on
 * the wallet variant.
 */
export interface WalletFeatures {
  /** Privacy features. */
  privacy: {
    /** Data collection information. */
    dataCollection: VariantFeature<DataCollection>;

    /** Privacy policy URL of the wallet. */
    privacyPolicy: VariantFeature<string>;
  };

  /** License of the wallet. */
  license: VariantFeature<License>;
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
  license: ResolvedFeature<License>;
}

/** Resolve a set of features according to the given variant. */
export function Resolve(features: WalletFeatures, variant: Variant): ResolvedFeatures {
  return {
    variant,
    privacy: {
      dataCollection: ResolveFeature(features.privacy.dataCollection, variant),
      privacyPolicy: ResolveFeature(features.privacy.privacyPolicy, variant),
    },
    license: ResolveFeature(features.license, variant),
  };
}
