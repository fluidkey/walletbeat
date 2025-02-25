import { isNonEmptyArray, nonEmptyValues, type NonEmptyArray } from '@/types/utils/non-empty'
import { type Attribute, type Evaluation, Rating, type Value } from '../attributes'
import type { AtLeastOneVariant, Variant } from '../variants'
import { type Sentence, sentence } from '@/types/content'
import type { WalletMetadata } from '../wallet'
import { unratedAttributeContent } from '@/types/content/unrated-attribute'

/**
 * Helper for constructing "Unrated" values.
 * @param brand Brand string to distinguish `Value` subtypes.
 */
export function unrated<V extends Value>(
	attribute: Attribute<V>,
	brand: string,
	extraProps: Omit<V, keyof (Value & { __brand: string })> extends Record<string, never>
		? null
		: Omit<V, keyof (Value & { __brand: string })>,
): Evaluation<V> {
	const value: Value = {
		id: 'unrated',
		rating: Rating.UNRATED,
		displayName: `${attribute.displayName}: Unrated`,
		shortExplanation: sentence('Walletbeat lacks the information needed to determine this.'),
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Combining the fields of Value with the fields of V that are not in Value creates a correct V-typed object.
	const v: V = {
		__brand: brand,
		...value,
		...(extraProps ?? {}),
	} as unknown as V
	return {
		value: v,
		details: unratedAttributeContent<V>(),
	}
}

/**
 * Helper for constructing "Exempt" values.
 * @param brand Brand string to distinguish `Value` subtypes.
 */
export function exempt<V extends Value>(
	attribute: Attribute<V>,
	whyExempt: Sentence<WalletMetadata>,
	brand: string,
	extraProps: Omit<V, keyof (Value & { __brand: string })> extends Record<string, never>
		? null
		: Omit<V, keyof (Value & { __brand: string })>,
): Evaluation<V> {
	const value: Value = {
		id: 'exempt',
		rating: Rating.EXEMPT,
		displayName: `${attribute.displayName}: Exempt`,
		shortExplanation: whyExempt,
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Combining the fields of Value with the fields of V that are not in Value creates a correct V-typed object.
	const v: V = {
		__brand: brand,
		...value,
		...(extraProps ?? {}),
	} as unknown as V
	return {
		value: v,
		details: {
			render: ({ wallet }) => whyExempt.render(wallet.metadata),
		},
	}
}

/**
 * Evaluation aggregation function that picks the worst rating.
 * @param perVariant Evaluation for at least one variant.
 * @returns The evaluation with the lowest rating.
 */
export function pickWorstRating<V extends Value>(
	evaluations: AtLeastOneVariant<Evaluation<V>> | NonEmptyArray<Evaluation<V>>,
): Evaluation<V> {
	let worst: Evaluation<V> | null = null
	const evaluationsArray =
		Array.isArray(evaluations) && isNonEmptyArray(evaluations)
			? evaluations
			: nonEmptyValues<Variant, Evaluation<V>>(evaluations)
	for (const evaluation of evaluationsArray) {
		if (evaluation.value.rating === Rating.UNRATED) {
			// If any evaluation is UNRATED, then the aggregated rating also is.
			// So return it immediately.
			return evaluation
		}
		if (worst === null) {
			// The first rating sets the initial value of `worst`.
			worst = evaluation
			continue
		}
		if (evaluation.value.rating === Rating.EXEMPT) {
			// Exempt ratings are ignored, unless they are the only rating we have.
			continue
		}
		if (worst.value.rating === Rating.EXEMPT) {
			// Any non-EXEMPT rating takes precedence over an EXEMPT rating.
			worst = evaluation
			continue
		}
		if (worst.value.rating === Rating.PASS) {
			// Any non-EXEMPT, non-UNRATED rating is worse or equal to PASS, so pick it.
			worst = evaluation
			continue
		}
		if (worst.value.rating === Rating.PARTIAL && evaluation.value.rating === Rating.FAIL) {
			// If the worst rating is PARTIAL, pick FAIL over it.
			worst = evaluation
			continue
		}
	}
	return worst! // eslint-disable-line @typescript-eslint/no-non-null-assertion -- Safe because we've just iterated over a NonEmptyArray and the first iteration would have set `worst` away from `null`.
}
