import type { ResolvedFeatures } from '@/schema/features';
import { License, FOSS, licenseIsFOSS, licenseName } from '@/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/schema/attributes';
import { pickWorstRating, unrated } from '../common';

const brand = 'attributes.transparency.open_source';
export type OpenSourceValue = Value & {
  license?: License;
  __brand: 'attributes.transparency.open_source';
};

function open(license: License): OpenSourceValue {
  return {
    id: license,
    rating: Rating.YES,
    icon: '\u{1f496}', // Sparkling heart
    displayName: `Open source (${licenseName(license)})`,
    license,
    __brand: brand,
  };
}

function openInTheFuture(license: License): OpenSourceValue {
  return {
    id: license,
    rating: Rating.PARTIAL,
    icon: '\u{2764}', // Mending heart
    displayName: `Open in the future (${licenseName(license)})`,
    license,
    __brand: brand,
  };
}

const proprietary: OpenSourceValue = {
  id: 'proprietary',
  rating: Rating.NO,
  icon: '\u{1f494}', // Broken heart
  displayName: 'Proprietary',
  license: License.PROPRIETARY,
  __brand: brand,
};

const unlicensed: OpenSourceValue = {
  id: 'unlicensed',
  rating: Rating.NO,
  icon: '\u{2754}', // White question mark
  displayName: 'Unlicensed',
  license: License.UNLICENSED_VISIBLE,
  __brand: brand,
};

export const openSource: Attribute<OpenSourceValue> = {
  id: 'open_source',
  icon: '\u{2764}', // Heart
  displayName: 'License',
  explanationValues: [open(License.APACHE_2_0), openInTheFuture(License.BUSL_1_1), proprietary],
  evaluate: (features: ResolvedFeatures): Evaluation<OpenSourceValue> => {
    if (features.license === null) {
      return { value: unrated(brand) as OpenSourceValue };
    }
    if (features.license === License.UNLICENSED_VISIBLE) {
      return { value: unlicensed };
    }
    switch (licenseIsFOSS(features.license)) {
      case FOSS.FOSS:
        return { value: open(features.license) };
      case FOSS.FUTURE_FOSS:
        return { value: openInTheFuture(features.license) };
      case FOSS.NOT_FOSS:
        return { value: proprietary };
    }
  },
  aggregate: pickWorstRating<OpenSourceValue>,
};
