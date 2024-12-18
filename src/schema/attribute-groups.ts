import {
  nonEmptyGet,
  type NonEmptyRecord,
  nonEmptyRemap,
  nonEmptyValues,
} from '@/types/utils/non-empty';
import {
  type Attribute,
  type AttributeGroup,
  defaultRatingScore,
  type EvaluatedAttribute,
  type EvaluatedGroup,
  type Value,
  type ValueSet,
} from './attributes';
import {
  addressCorrelation,
  type AddressCorrelationValue,
} from './attributes/privacy/address-correlation';
import { openSource, type OpenSourceValue } from './attributes/transparency/open-source';
import {
  sourceVisibility,
  type SourceVisibilityValue,
} from './attributes/transparency/source-visibility';
import type { ResolvedFeatures } from './features';
import type { AtLeastOneVariant, Variant } from './variants';
import type { Dict } from '@/types/utils/dict';
import { funding, type FundingValue } from './attributes/transparency/funding';
import {
  multiAddressCorrelation,
  type MultiAddressCorrelationValue,
} from './attributes/privacy/multi-address-correlation';
import { type Score, type WeightedScore, weightedScore } from './score';
import { sentence } from '@/types/text';
import type { WalletMetadata } from './wallet';

/** A ValueSet for privacy Values. */
type PrivacyValues = Dict<{
  addressCorrelation: AddressCorrelationValue;
  multiAddressCorrelation: MultiAddressCorrelationValue;
}>;

/** Privacy attributes. */
export const PrivacyAttributeGroup: AttributeGroup<PrivacyValues> = {
  id: 'privacy',
  icon: '\u{1f575}', // Detective
  displayName: 'Privacy',
  perWalletQuestion: sentence<WalletMetadata>(
    (walletMetadata: WalletMetadata): string =>
      `How well does ${walletMetadata.displayName} protect your privacy?`
  ),
  attributes: {
    addressCorrelation,
    multiAddressCorrelation,
  },
  score: scoreGroup<PrivacyValues>({
    addressCorrelation: 1.0,
    multiAddressCorrelation: 1.0,
  }),
};

/** A ValueSet for transparency Values. */
type TransparencyValues = Dict<{
  openSource: OpenSourceValue;
  sourceVisibility: SourceVisibilityValue;
  funding: FundingValue;
}>;

/** Transparency attributes. */
export const transparencyAttributeGroup: AttributeGroup<TransparencyValues> = {
  id: 'transparency',
  icon: '\u{1f50d}', // Looking glass
  displayName: 'Transparency',
  perWalletQuestion: sentence<WalletMetadata>(
    (walletMetadata: WalletMetadata): string =>
      `How transparent and sustainable is ${walletMetadata.displayName}'s development model?`
  ),
  attributes: {
    openSource,
    sourceVisibility,
    funding,
  },
  score: scoreGroup<TransparencyValues>({
    openSource: 1.0,
    sourceVisibility: 1.0,
    funding: 1.0,
  }),
};

/** The set of attribute groups that make up wallet attributes. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Necessary to allow any Attribute implementation.
export const attributeTree: NonEmptyRecord<string, AttributeGroup<any>> = {
  privacy: PrivacyAttributeGroup,
  transparency: transparencyAttributeGroup,
};

/** Evaluated privacy attributes for a single wallet. */
export interface PrivacyEvaluations extends EvaluatedGroup<PrivacyValues> {
  addressCorrelation: EvaluatedAttribute<AddressCorrelationValue>;
}

/** Evaluated transparency attributes for a single wallet. */
export interface TransparencyEvaluations extends EvaluatedGroup<TransparencyValues> {
  openSource: EvaluatedAttribute<OpenSourceValue>;
  sourceVisibility: EvaluatedAttribute<SourceVisibilityValue>;
}

/** Evaluated attributes for a single wallet. */
export interface EvaluationTree
  extends NonEmptyRecord<string, EvaluatedGroup<PrivacyValues | TransparencyValues>> {
  privacy: PrivacyEvaluations;
  transparency: TransparencyEvaluations;
}

/** Rate a wallet's attributes based on its features. */
export function evaluateAttributes(features: ResolvedFeatures): EvaluationTree {
  const evalAttr = <V extends Value>(attr: Attribute<V>): EvaluatedAttribute<V> => ({
    attribute: attr,
    evaluation: attr.evaluate(features),
  });
  return {
    privacy: {
      addressCorrelation: evalAttr(addressCorrelation),
      multiAddressCorrelation: evalAttr(multiAddressCorrelation),
    },
    transparency: {
      openSource: evalAttr(openSource),
      sourceVisibility: evalAttr(sourceVisibility),
      funding: evalAttr(funding),
    },
  };
}

/**
 * Aggregate per-variant evaluated attributes into
 * a single non-per-variant tree of evaluated attributes.
 */
export function aggregateAttributes(perVariant: AtLeastOneVariant<EvaluationTree>): EvaluationTree {
  const attr = <V extends Value>(
    getter: (tree: EvaluationTree) => EvaluatedAttribute<V>
  ): EvaluatedAttribute<V> => {
    const attribute = getter(
      nonEmptyGet(nonEmptyValues<Variant, EvaluationTree>(perVariant))
    ).attribute;
    const evaluations = nonEmptyRemap(
      perVariant,
      (_: Variant, tree: EvaluationTree) => getter(tree).evaluation
    );
    return {
      attribute,
      evaluation: attribute.aggregate(evaluations),
    };
  };
  return {
    privacy: {
      addressCorrelation: attr(tree => tree.privacy.addressCorrelation),
      multiAddressCorrelation: attr(tree => tree.privacy.multiAddressCorrelation),
    },
    transparency: {
      openSource: attr(tree => tree.transparency.openSource),
      sourceVisibility: attr(tree => tree.transparency.sourceVisibility),
      funding: attr(tree => tree.transparency.funding),
    },
  };
}

/**
 * Generic function for scoring a group of evaluations.
 * @param weights A map from attribute name to its relative weight.
 * @returns A function to score of the group of evaluations.
 */
function scoreGroup<Vs extends ValueSet>(weights: { [k in keyof Vs]: number }): (
  evaluations: EvaluatedGroup<Vs>
) => Score {
  return (evaluations: EvaluatedGroup<Vs>): Score =>
    weightedScore(
      nonEmptyRemap(weights, (key: keyof Vs, weight: number): WeightedScore => {
        const value = evaluations[key].evaluation.value;
        return {
          score: value.score ?? defaultRatingScore(value.rating),
          weight,
        };
      })
    );
}
