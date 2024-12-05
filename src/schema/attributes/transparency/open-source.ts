import type { ResolvedFeatures } from '@/schema/features';
import { License, FOSS, LicenseIsFOSS, LicenseName } from '@/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/schema/attributes';
import { Unrated } from '../common';

const brand = 'attributes.transparency.open_source';
export type OpenSourceValue = Value & {
  license?: License;
  __brand: 'attributes.transparency.open_source';
};

function Open(license: License): OpenSourceValue {
  return {
    id: license,
    rating: Rating.YES,
    display_name: `Open (${LicenseName(license)})`,
    license,
    __brand: brand,
  };
}

function OpenInTheFuture(license: License): OpenSourceValue {
  return {
    id: license,
    rating: Rating.PARTIAL,
    display_name: `Open in the future (${LicenseName(license)})`,
    license,
    __brand: brand,
  };
}

const Proprietary: OpenSourceValue = {
  id: 'proprietary',
  rating: Rating.NO,
  display_name: 'Proprietary',
  license: License.PROPRIETARY,
  __brand: brand,
};

export const OpenSource: Attribute<OpenSourceValue> = {
  id: 'open_source',
  display_name: 'Open source',
  explanation_values: [Open(License.APACHE_2_0), OpenInTheFuture(License.BUSL_1_1), Proprietary],
  evaluate: (features: ResolvedFeatures): Evaluation<OpenSourceValue> => {
    if (features.license === null) {
      return { value: Unrated(brand) as OpenSourceValue };
    }
    switch (LicenseIsFOSS(features.license)) {
      case FOSS.FOSS:
        return { value: Open(features.license) };
      case FOSS.FUTURE_FOSS:
        return { value: OpenInTheFuture(features.license) };
      case FOSS.NOT_FOSS:
        return { value: Proprietary };
    }
  },
};
