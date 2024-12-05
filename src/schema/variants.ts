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

/** Maps each variant to a T. */
export type Variants<T> = Partial<Record<Variant, T>>;

/**
 * A feature that may or may not depend on the wallet variant.
 * 'null' represents the fact that the feature was not evaluated on a wallet.
 */
export type VariantFeature<T> = T | Variants<T> | null;

/** Type guard for the Variants<T> branch of VariantsFeature<T>. */
function isVariants<T>(value: VariantFeature<T>): value is Variants<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.hasOwn(value, 'mobile') &&
    Object.hasOwn(value, 'desktop') &&
    Object.hasOwn(value, 'browser')
  );
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
export function ResolveFeature<T>(
  feature: VariantFeature<T>,
  variant: Variant
): ResolvedFeature<T> {
  if (feature === null) {
    return null;
  }
  if (isVariants(feature)) {
    return feature[variant] ?? null;
  }
  return feature;
}
