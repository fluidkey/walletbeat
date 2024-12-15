import type { ResolvedFeatures } from '@/schema/features';
import { licenseSourceIsVisible } from '@/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/schema/attributes';
import { pickWorstRating, unrated } from '../common';

const brand = 'attributes.transparency.source_visibility';
export type SourceVisibilityValue = Value & {
  __brand: 'attributes.transparency.source_visibility';
};

const sourcePublic: SourceVisibilityValue = {
  id: 'public',
  rating: Rating.YES,
  displayName: 'Public',
  __brand: brand,
};

const sourcePrivate: SourceVisibilityValue = {
  id: 'private',
  rating: Rating.NO,
  displayName: 'Private',
  __brand: brand,
};

export const sourceVisibility: Attribute<SourceVisibilityValue> = {
  id: 'source_visibility',
  icon: '\u{1f35d}', // Spaghetti
  displayName: 'Source visibility',
  explanationValues: [sourcePublic, sourcePrivate],
  evaluate: (features: ResolvedFeatures): Evaluation<SourceVisibilityValue> => {
    if (features.license === null) {
      return { value: unrated(brand) as SourceVisibilityValue };
    }
    if (licenseSourceIsVisible(features.license)) {
      return { value: sourcePublic };
    }
    return { value: sourcePrivate };
  },
  aggregate: pickWorstRating<SourceVisibilityValue>,
};
