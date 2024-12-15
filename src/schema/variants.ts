import type { NonEmptyRecord } from '@/types/utils/non-empty';

/**
 * An enum of wallet variants.
 * Used to specify feature differences between variants of the same wallet
 * across different of its implementations.
 */
export enum Variant {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  BROWSER = 'browser',
}

/** Maps all variants to a T. */
export type ComprehensiveVariants<T> = Record<Variant, T>;

/** Maps at least one variant to a T. */
export type AtLeastOneVariant<T> = NonEmptyRecord<Variant, T>;

/**
 * A feature that may or may not depend on the wallet variant.
 * 'null' represents the fact that the feature was not evaluated on a wallet.
 */
export type VariantFeature<T> = T | AtLeastOneVariant<T> | null;

/** Type guard for the AtLeastOneVariant<T> branch of VariantsFeature<T>. */
function isAtLeastOneVariants<T>(value: VariantFeature<T>): value is AtLeastOneVariant<T> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  let foundVariant = false;
  let foundNonVariant = false;
  Object.keys(value).forEach(key => {
    if (key === 'mobile' || key === 'desktop' || key === 'browser') {
      foundVariant = true;
    } else {
      foundNonVariant = true;
    }
  });
  return foundVariant && !foundNonVariant; // eslint-disable-line @typescript-eslint/no-unnecessary-condition -- Not sure why it thinks this is an unnecessary conditional.
}

/**
 * A feature that has been resolved to a single value,
 * either because we know which variant we are interested in,
 * or because there was only one possible value for this feature
 * to begin with.
 * 'null' represents the fact that the feature was not evaluated on a wallet.
 */
export type ResolvedFeature<T> = T | null;

/** Resolve a single feature according to the given variant. */
export function resolveFeature<T>(
  feature: VariantFeature<T>,
  variant: Variant
): ResolvedFeature<T> {
  if (feature === null) {
    return null;
  }
  if (isAtLeastOneVariants(feature)) {
    return feature[variant] ?? null;
  }
  return feature;
}
