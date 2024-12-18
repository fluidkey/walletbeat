import type { ResolvedFeatures } from '@/schema/features';
import { License, FOSS, licenseIsFOSS, licenseName } from '@/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import { sentence } from '@/types/text';
import type { WalletMetadata } from '@/schema/wallet';

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
    walletExplanation: sentence(
      (walletMetadata: WalletMetadata) =>
        `${walletMetadata.displayName}'s source code is under an open-source license (${licenseName(license)}).`
    ),
    license,
    __brand: brand,
  };
}

function openInTheFuture(license: License): OpenSourceValue {
  return {
    id: license,
    rating: Rating.PARTIAL,
    icon: '\u{2764}', // Mending heart
    displayName: `Open source in the future (${licenseName(license)})`,
    walletExplanation: sentence(
      (walletMetadata: WalletMetadata) =>
        `${walletMetadata.displayName} (${licenseName(license)})'s code license commits to transition to open-source in the future.`
    ),
    license,
    __brand: brand,
  };
}

const proprietary: OpenSourceValue = {
  id: 'proprietary',
  rating: Rating.NO,
  icon: '\u{1f494}', // Broken heart
  displayName: 'Proprietary code license',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} uses a proprietary source code license.`
  ),
  license: License.PROPRIETARY,
  __brand: brand,
};

const unlicensed: OpenSourceValue = {
  id: 'unlicensed',
  rating: Rating.NO,
  icon: '\u{2754}', // White question mark
  displayName: 'Unlicensed or missing license file',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} does not have a valid license for its source code.`
  ),
  license: License.UNLICENSED_VISIBLE,
  __brand: brand,
};

export const openSource: Attribute<OpenSourceValue> = {
  id: 'open_source',
  icon: '\u{2764}', // Heart
  displayName: 'Source code license',
  explanationValues: [open(License.APACHE_2_0), openInTheFuture(License.BUSL_1_1), proprietary],
  evaluate: (features: ResolvedFeatures): Evaluation<OpenSourceValue> => {
    if (features.license === null) {
      return { value: unrated(openSource, brand) };
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
