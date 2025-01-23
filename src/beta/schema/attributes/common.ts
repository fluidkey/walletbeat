import { nonEmptyValues } from '@/beta/types/utils/non-empty';
import { type Attribute, type Evaluation, Rating, type Value } from '../attributes';
import type { AtLeastOneVariant, Variant } from '../variants';
import { component, sentence } from '@/beta/types/text';
import { UnratedAttribute } from '@/beta/components/ui/molecules/attributes/UnratedAttribute';

/**
 * Helper for constructing "Unrated" values.
 * @param brand Brand string to distinguish `Value` subtypes.
 */
export function unrated<V extends Value>(
  attribute: Attribute<V>,
  brand: string,
  extraProps: Omit<V, keyof (Value & { __brand: string })> extends Record<string, never>
    ? null
    : Omit<V, keyof (Value & { __brand: string })>
): Evaluation<V> {
  const value: Value = {
    id: 'unrated',
    rating: Rating.UNRATED,
    displayName: `${attribute.displayName}: Unrated`,
    shortExplanation: sentence('Walletbeat lacks the information needed to determine this.'),
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Combining the fields of Value with the fields of V that are not in Value creates a correct V-typed object.
  const v: V = {
    __brand: brand,
    ...value,
    ...(extraProps ?? {}),
  } as unknown as V;
  return {
    value: v,
    details: component(UnratedAttribute),
  };
}

/**
 * Evaluation aggregation function that picks the worst rating.
 * @param perVariant Evaluation for at least one variant.
 * @returns The evaluation with the lowest rating.
 */
export function pickWorstRating<V extends Value>(
  perVariant: AtLeastOneVariant<Evaluation<V>>
): Evaluation<V> {
  let worst: Evaluation<V> | null = null;
  for (const evaluation of nonEmptyValues<Variant, Evaluation<V>>(perVariant)) {
    if (worst === null) {
      worst = evaluation;
      continue;
    }
    if (worst.value.rating === Rating.UNRATED || worst.value.rating === Rating.PASS) {
      worst = evaluation;
      continue;
    }
    if (worst.value.rating === Rating.PARTIAL && evaluation.value.rating === Rating.FAIL) {
      worst = evaluation;
      continue;
    }
  }
  return worst!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- Safe because perVariant must contain at least one variant.
}
