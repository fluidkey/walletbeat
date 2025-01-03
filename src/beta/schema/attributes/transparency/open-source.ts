import type { ResolvedFeatures } from '@/beta/schema/features';
import { License, FOSS, licenseIsFOSS, licenseName } from '@/beta/schema/features/license';
import { Rating, type Value, type Attribute, type Evaluation } from '@/beta/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import { component, paragraph, sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';
import { LicenseDetails } from '@/beta/components/ui/molecules/attributes/transparency/LicenseDetails';

const brand = 'attributes.transparency.open_source';
export type OpenSourceValue = Value & {
  license: License;
  __brand: 'attributes.transparency.open_source';
};

function open(license: License): Evaluation<OpenSourceValue> {
  return {
    value: {
      id: license,
      rating: Rating.YES,
      icon: '\u{1f496}', // Sparkling heart
      displayName: `Open source (${licenseName(license)})`,
      shortExplanation: sentence(
        (walletMetadata: WalletMetadata) => `
          ${walletMetadata.displayName}'s source code is under an open-source
          license (${licenseName(license)}).
        `
      ),
      license,
      __brand: brand,
    },
    details: component(LicenseDetails),
  };
}

function openInTheFuture(license: License): Evaluation<OpenSourceValue> {
  return {
    value: {
      id: license,
      rating: Rating.PARTIAL,
      icon: '\u{2764}', // Mending heart
      displayName: `Open source in the future (${licenseName(license)})`,
      shortExplanation: sentence(
        (walletMetadata: WalletMetadata) => `
          ${walletMetadata.displayName} (${licenseName(license)})'s code
          license commits to transition to open-source in the future.
        `
      ),
      license,
      __brand: brand,
    },
    details: component(LicenseDetails),
  };
}

const proprietary: Evaluation<OpenSourceValue> = {
  value: {
    id: 'proprietary',
    rating: Rating.NO,
    icon: '\u{1f494}', // Broken heart
    displayName: 'Proprietary code license',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} uses a proprietary source code license.
      `
    ),
    license: License.PROPRIETARY,
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} uses a proprietary or non-FOSS source code
      license. Therefore, it is not Free and Open Source Software.
    `
  ),
  howToImprove: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} should consider re-licensing under a
      Free and Open Source Software license.
    `
  ),
};

const unlicensed: Evaluation<OpenSourceValue> = {
  value: {
    id: 'unlicensed',
    rating: Rating.NO,
    icon: '\u{2754}', // White question mark
    displayName: 'Unlicensed or missing license file',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} does not have a valid license for its
        source code.
      `
    ),
    license: License.UNLICENSED_VISIBLE,
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} does not have a valid license for its
      source code.
      This is most likely an accidental omission, but a lack of license means
      that even if ${wallet.metadata.displayName} is functionally identical to
      an open-source project, it may later decide to set its license to a
      proprietary license. Therefore, ${wallet.metadata.displayName} is assumed
      to not be Free and Open Source Software until it does have a valid
      license file.
    `
  ),
  howToImprove: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} should add a license file to its source
      code.
    `
  ),
};

export const openSource: Attribute<OpenSourceValue> = {
  id: 'openSource',
  icon: '\u{2764}', // Heart
  displayName: 'Source code license',
  question: sentence(`
    Is the wallet's source code licensed under a Free and Open Source Software (FOSS) license?
  `),
  why: paragraph(`
    Free and Open Source Software (FOSS) licensing allows a software project's
    source code to be freely used, modified and distributed. This allows
    better collaboration, more transparency into the software development
    practices that go into the project, and allows security researchers to
    more easily identify and report security vulnerabilities.
    In short, it turns software project into public goods.
  `),
  explanationValues: [
    open(License.APACHE_2_0).value,
    openInTheFuture(License.BUSL_1_1).value,
    proprietary.value,
  ],
  evaluate: (features: ResolvedFeatures): Evaluation<OpenSourceValue> => {
    if (features.license === null) {
      return unrated(openSource, brand, { license: License.UNLICENSED_VISIBLE });
    }
    if (features.license === License.UNLICENSED_VISIBLE) {
      return unlicensed;
    }
    switch (licenseIsFOSS(features.license)) {
      case FOSS.FOSS:
        return open(features.license);
      case FOSS.FUTURE_FOSS:
        return openInTheFuture(features.license);
      case FOSS.NOT_FOSS:
        return proprietary;
    }
  },
  aggregate: pickWorstRating<OpenSourceValue>,
};
