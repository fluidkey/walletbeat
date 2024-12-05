import type { ResolvedFeatures } from './features';

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
   * A very short, human-readable name for this value.
   * For example, when evaluating an attribute like open-source licensing,
   * this could say "Apache 2.0".
   * This should avoid repeating the display_name of the Attribute as best
   * as possible. Instead, the concatenation of the Attribute's
   * display_name and the Value's display_name should make sense.
   * For example, an Attribute's display_name could be "License" and the
   * Value's display_name could be "Apache 2.0", because the string
   * "License: Apache 2.0" makes sense on its own. The Value's display_name
   * should not be "Apache 2.0 license", because
   * "License: Apache 2.0 license" would needlessly repeat "license" twice.
   */
  display_name: string;

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
  url?: string;
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
   * For example: "source_visibility".
   */
  id: string;

  /** A very short, human-readable name of the attribute.
   * Should be no more than 3 or 4 words.
   * Should make sense when concatenated with a Value's display_name.
   * For example, for the source_visibility attribute, this would just be
   * "Source", not "Source visibility", because the Value's display_name
   * will say "Public" or "Private" which already makes it clear that it
   * is referring to the wallet's source visibility.
   */
  display_name: string;

  /*
   * A list of possible values that this attribute may have, with the goal
   * of covering a large enough set of possible values such that a human
   * can understand what the attribute is about and how the attribute can
   * be fulfilled.
   * This is not necessarily an exhaustive list. It is used on the details
   * page describing what the attribute is about in order to show a list
   * of possible ways in which it can be fulfilled. For example, this can
   * contain values representing various open-source and non-open-source
   * licenses, but it does not have to be comprehensive.
   * This should not contain any entries with the "Unrated" display_rating.
   */
  explanation_values: V[];

  /** Evaluate the attribute for a given set of wallet features.
   * This function is the default way in which attributes are evaluated.
   * However, a wallet may override the evaluation of an attribute using
   * overrides.
   */
  evaluate: Evaluate<V>;
}
