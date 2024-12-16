import type { NonEmptyArray, NonEmptyRecord } from '@/types/utils/non-empty';
import type { ResolvedFeatures } from './features';
import type { AtLeastOneVariant } from './variants';
import type { Url } from './url';

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
   * A very short, human-readable name for this value.
   * For example, when evaluating an attribute like open-source licensing,
   * this could say "Apache 2.0".
   * This should avoid repeating the displayName of the Attribute as best
   * as possible. Instead, the concatenation of the Attribute's
   * displayName and the Value's displayName should make sense.
   * For example, an Attribute's displayName could be "License" and the
   * Value's displayName could be "Apache 2.0", because the string
   * "License: Apache 2.0" makes sense on its own. The Value's displayName
   * should not be "Apache 2.0 license", because
   * "License: Apache 2.0 license" would needlessly repeat "license" twice.
   */
  displayName: string;

  /**
   * The visual representation of this value.
   * For example, when evaluating an attribute like open-source licensing,
   * this could say "Yes" if the wallet is Apache-licensed or MIT-licensed,
   * "Partial" if the wallet is BUSL-licensed, or "No" if the wallet is
   * proprietary.
   */
  rating: Rating;
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

  icon: string;

  /** A very short, human-readable name of the attribute.
   * Should be no more than 3 or 4 words.
   * Should make sense when concatenated with a Value's displayName.
   * For example, for the sourceVisibility attribute, this would just be
   * "Source", not "Source visibility", because the Value's displayName
   * will say "Public" or "Private" which already makes it clear that it
   * is referring to the wallet's source visibility.
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

  /** The actual set of attributes belonging to this group. */
  attributes: { [K in keyof Vs]: Attribute<Vs[K]> };

  /**
   * A scoring function for the attributes.
   * @param evaluations The set of evaluated attributes.
   * @return A score between 0.0 (lowest) and 1.0 (highest).
   */
  score: (evaluations: EvaluatedGroup<Vs>) => number;
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
