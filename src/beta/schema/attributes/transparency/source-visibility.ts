import type { ResolvedFeatures } from '@/beta/schema/features';
import { licenseSourceIsVisible } from '@/beta/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/beta/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import { sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';

const brand = 'attributes.transparency.source_visibility';
export type SourceVisibilityValue = Value & {
  __brand: 'attributes.transparency.source_visibility';
};

const sourcePublic: SourceVisibilityValue = {
  id: 'public',
  rating: Rating.YES,
  displayName: 'Source code publicly available',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `The source code for ${walletMetadata.displayName} is available to be viewed by the public.`
  ),
  __brand: brand,
};

const sourcePrivate: SourceVisibilityValue = {
  id: 'private',
  rating: Rating.NO,
  displayName: 'Source code not publicly available',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `The source code for ${walletMetadata.displayName} is not available to the public.`
  ),
  __brand: brand,
};

export const sourceVisibility: Attribute<SourceVisibilityValue> = {
  id: 'source_visibility',
  icon: '\u{1f35d}', // Spaghetti
  displayName: 'Source visibility',
  explanationValues: [sourcePublic, sourcePrivate],
  evaluate: (features: ResolvedFeatures): Evaluation<SourceVisibilityValue> => {
    if (features.license === null) {
      return { value: unrated(sourceVisibility, brand) };
    }
    if (licenseSourceIsVisible(features.license)) {
      return { value: sourcePublic };
    }
    return { value: sourcePrivate };
  },
  aggregate: pickWorstRating<SourceVisibilityValue>,
};
