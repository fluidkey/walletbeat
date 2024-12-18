import type { NonEmptyArray, NonEmptyRecord } from '@/beta/types/utils/non-empty';
import type { ResolvedFeatures } from './features';
import type { AtLeastOneVariant } from './variants';
import type { Url } from './url';
import type { Score } from './score';
import type { Sentence } from '@/beta/types/text';
import type { WalletMetadata } from './wallet';

/**
 * Rating is an enum that should be visually meaningful.
 * It is used to determine the color of the pie chart for an attribute.
 */
export enum Rating {
  /**
   * UNRATED means the attribute was not rated.
   *This is displayed in a neutral color.
   */
  UNRATED = 'UNRATED',

  /**
   * No means the wallet does not fulfill this attribute.
   */
  NO = 'NO',

  /**
   * Partial means the wallet partially fulfills this attribute
   * (e.g. only with non-trivial user configuration, or with important
   * caveats.)
   */
  PARTIAL = 'PARTIAL',

  /**
   * Yes means the wallet fully fulfills this attribute.
   */
  YES = 'YES',
}

/**
 * Value is one of multiple possible outcomes when evaluating an attribute.
 * It is *not* wallet-specific, and may often be enum-like.
 * For example, when evaluating an attribute like open-source licensing,
 * one particular Value could represent the Apache license, and another
 * could represent the MIT license.
 */
export interface Value {
  /**
   * An ID representing the value.
   * This needs to be unique within the set of possible values that the
   * attribute may have, but does not need to be unique within the set of
   * all values across all attributes.
   * This can be used by rendering code to display value-specific content.
   * For example, when evaluating an attribute like open-source licensing,
   * the attribute of the value may be the ID of the license.
   */
  id: string;

  /**
   * An icon that represents the *attribute* when this value is used to
   * rate it. Optional, only used where it makes sense.
   * For example, if an attribute has the "chain" icon, one of the ratings
   * might use the "broken chain" icon.
   */
  icon?: string;

  /**
   * A very short, human-readable explanation of this value.
   * Used as tooltip when hovering over the attribute rating in the charts.
   * This should relate to the attribute's displayName but stand on its own.
   * For example, when evaluating an attribute like open-source licensing,
   * this could say "Apache 2.0 license", not just "Apache 2.0" as that would
   * be meaningless out of context.
   */
  displayName: string;

  /**
   * A very short, human-readable explanation of this value.
   * Should be similar to `displayName` but may be formatted with the name
   * of the wallet.
   */
  walletExplanation: Sentence<WalletMetadata>;

  /**
   * The visual representation of this value.
   * For example, when evaluating an attribute like open-source licensing,
   * this could say "Yes" if the wallet is Apache-licensed or MIT-licensed,
   * "Partial" if the wallet is BUSL-licensed, or "No" if the wallet is
   * proprietary.
   */
  rating: Rating;

  /**
   * A score representing this value on this specific attribute.
   * For any given Attribute, there should be at least one way to get a
   * score of 1.0.
   * If unspecified, the score is derived  using `defaultRatingScore`.
   */
  score?: Score;
}

/** The numerical score corresponding to a rating by default. */
export function defaultRatingScore(rating: Rating): Score {
  switch (rating) {
    case Rating.NO:
      return 0.0;
    case Rating.PARTIAL:
      return 0.5;
    case Rating.YES:
      return 1.0;
    case Rating.UNRATED:
      return 0.0;
  }
}

/**
 * Evaluation is the result of evaluating how well a specific wallet fulfills
 * an attribute. Unlike Value, an Evaluation is wallet-specific.
 */
export interface Evaluation<V extends Value> {
  /**
   * The value representing how well the wallet fulfills the attribute.
   */
  value: V;

  /** A link to a relevant URL about this wallet's implementation of the
   * attribute. For attributes that the wallet does not fulfill, this can
   * be a link to a bug tracker that tracks implementation of the attribute.
   */
  url?: Url;
}

/**
 * Evaluate is a function that takes in wallet features and returns an
 * evaluation for a specific attribute.
 */
export type Evaluate<V extends Value> = (features: ResolvedFeatures) => Evaluation<V>;

/**
 * Attribute represents a desirable property that wallets should have.
 * It corresponds to one slice of the pie chart displayed for each wallet.
 * For example, an attribute could be about whether or not a wallet is
 * licensed under an open-source license.
 */
export interface Attribute<V extends Value> {
  /**
   * Unique ID representing the attribute.
   * For example: "sourceVisibility".
   */
  id: string;

  /** An icon representing the attribute. Shown on rating charts. */
  icon: string;

  /**
   * A very short, human-readable title for the attribute.
   * Should be no more than 3 or 4 words.
   */
  displayName: string;

  /**
   * A list of possible values that this attribute may have, with the goal
   * of covering a large enough set of possible values such that a human
   * can understand what the attribute is about and how the attribute can
   * be fulfilled.
   * This is not necessarily an exhaustive list. It is used on the details
   * page describing what the attribute is about in order to show a list
   * of possible ways in which it can be fulfilled. For example, this can
   * contain values representing various open-source and non-open-source
   * licenses, but it does not have to be comprehensive.
   * This should not contain any entries with the "Unrated" displayRating.
   */
  explanationValues: NonEmptyArray<V>;

  /** Evaluate the attribute for a given set of wallet features.
   * This function is the default way in which attributes are evaluated.
   * However, a wallet may override the evaluation of an attribute using
   * overrides.
   */
  evaluate: Evaluate<V>;

  /**
   * Aggregates one or more per-variant evaluations into a single one.
   * @param perVariant One or more per-variant evaluations.
   * @returns The aggregated evaluation for these per-variant evaluations.
   */
  aggregate: (perVariant: AtLeastOneVariant<Evaluation<V>>) => Evaluation<V>;
}

export interface EvaluatedAttribute<V extends Value> {
  attribute: Attribute<V>;
  evaluation: Evaluation<V>;
}

/**
 * A map of values. Should be a dictionary, i.e. its set of properties should
 * be fixed. Used to define attribute groups.
 */
export type ValueSet = NonEmptyRecord<string, Value>;

/**
 * An attribute group is a collection of attributes that are related to one
 * another. For example, all attributes about privacy would be in the same
 * attribute group.
 */
export interface AttributeGroup<Vs extends ValueSet> {
  /** Unique ID of the attribute group. */
  id: string;

  /** A friendly icon for the group. */
  icon: string;

  /** A human-readable name for the group. */
  displayName: string;

  /**
   * A short question to which this attribute is the answer.
   * For example, for an attribute group about privacy, a good question
   * might be "How well does {wallet} protect your privacy?".
   */
  perWalletQuestion: Sentence<WalletMetadata>;

  /** The actual set of attributes belonging to this group. */
  attributes: { [K in keyof Vs]: Attribute<Vs[K]> };

  /**
   * A scoring function for the attributes.
   * @param evaluations The set of evaluated attributes.
   * @return A score between 0.0 (lowest) and 1.0 (highest).
   */
  score: (evaluations: EvaluatedGroup<Vs>) => Score;
}

/**
 * An evaluated group is a collection of evaluated attributes that are related
 * to one another. For example, all evaluated attributed about privacy would
 * be in the same evaluation group.
 */
export type EvaluatedGroup<Vs extends ValueSet> = {
  [K in keyof Vs]: EvaluatedAttribute<Vs[K]>;
};

/**
 * Convenience method to iterate over all evaluated attributes in a group.
 * @param evaluatedGroup The group to iterate over.
 * @returns An array of all the evaluated attributes in the group.
 */
export function evaluatedAttributes<Vs extends ValueSet>(
  evaluatedGroup: EvaluatedGroup<Vs>
): NonEmptyArray<EvaluatedAttribute<Value>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- We know that ValueSets cannot be empty, therefore neither can this array.
  return Object.values(evaluatedGroup) as NonEmptyArray<EvaluatedAttribute<Value>>;
}
