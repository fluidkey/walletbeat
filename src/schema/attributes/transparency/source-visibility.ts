import type { ResolvedFeatures } from '@/schema/features';
import { LicenseSourceIsVisible } from '@/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/schema/attributes';
import { Unrated } from '../common';

const brand = 'attributes.transparency.source_visibility';
export type SourceVisibilityValue = Value & {
  __brand: 'attributes.transparency.source_visibility';
};

const Public: SourceVisibilityValue = {
  id: 'public',
  rating: Rating.YES,
  display_name: 'Public',
  __brand: brand,
};

const Private: SourceVisibilityValue = {
  id: 'private',
  rating: Rating.NO,
  display_name: 'Private',
  __brand: brand,
};

export const SourceVisibility: Attribute<SourceVisibilityValue> = {
  id: 'source_visibility',
  display_name: 'Source visibility',
  explanation_values: [Public, Private],
  evaluate: (features: ResolvedFeatures): Evaluation<SourceVisibilityValue> => {
    if (features.license === null) {
      return { value: Unrated(brand) as SourceVisibilityValue };
    }
    if (LicenseSourceIsVisible(features.license)) {
      return { value: Public };
    }
    return { value: Private };
  },
};
