import type { ResolvedFeatures } from '@/beta/schema/features';
import { Rating, type Value, type Attribute, type Evaluation } from '@/beta/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import {
  compareLeakedInfo,
  type Entity,
  inferLeaks,
  Leak,
  type LeakedInfo,
  leakedInfoName,
  leakedInfos,
  LeakedInfoType,
  leakedInfoType,
  LeakedPersonalInfo,
  type Leaks,
  leaksByDefault,
} from '@/beta/schema/features/privacy/data-collection';
import { component, paragraph, sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';
import { AddressCorrelationDetails } from '@/beta/components/ui/molecules/attributes/privacy/AddressCorrelationDetails';
import { exampleCex, exampleNodeCompany } from '@/beta/data/entities/example';
import {
  isNonEmptyArray,
  type NonEmptyArray,
  nonEmptyFirst,
  nonEmptyMap,
} from '@/beta/types/utils/non-empty';
import { type FullyQualifiedReference, refs } from '../../reference';

const brand = 'attributes.privacy.address_correlation';
export type AddressCorrelationValue = Value & {
  __brand: 'attributes.privacy.address_correlation';
};

const uncorrelated: AddressCorrelationValue = {
  id: 'no_correlation',
  rating: Rating.YES,
  icon: '\u{26d3}', // Broken chain
  displayName: 'Wallet address is kept private',
  shortExplanation: sentence(
    (walletMetadata: WalletMetadata) => `
      ${walletMetadata.displayName} keeps your wallet address private.
    `
  ),
  __brand: brand,
};

export interface WalletAddressLinkableTo {
  info: LeakedInfo;
  leak: Leak;
  refs: FullyQualifiedReference[];
}

export type WalletAddressLinkableBy = WalletAddressLinkableTo & {
  by: Entity | 'onchain';
};

function linkable(
  linkables: NonEmptyArray<WalletAddressLinkableBy>
): Evaluation<AddressCorrelationValue> {
  const worstLeak = nonEmptyFirst(
    linkables,
    (linkableA: WalletAddressLinkableBy, linkableB: WalletAddressLinkableBy) =>
      compareLeakedInfo(linkableA.info, linkableB.info),
    true
  );
  const rating =
    worstLeak.info === LeakedPersonalInfo.IP_ADDRESS ||
    worstLeak.info === LeakedPersonalInfo.PSEUDONYM
      ? Rating.PARTIAL
      : Rating.NO;
  return {
    value: {
      id: `address_and_${worstLeak.info}`,
      rating,
      displayName: `Wallet address linkable to ${leakedInfoName(worstLeak.info).short}`,
      shortExplanation: sentence((walletMetadata: WalletMetadata) => {
        if (worstLeak.by === 'onchain') {
          return `
          ${walletMetadata.displayName} publishes your
          ${leakedInfoName(worstLeak.info, walletMetadata).short}
          onchain.
        `;
        }
        return `
        ${walletMetadata.displayName} allows ${worstLeak.by.name}
        to link your wallet address with your
        ${leakedInfoName(worstLeak.info, walletMetadata).short}.
      `;
      }),
      __brand: brand,
    },
    details: component(AddressCorrelationDetails, { linkables }),
  };
}

export function linkableToWalletAddress(leaks: Leaks): WalletAddressLinkableTo[] {
  const qualLeaks = inferLeaks(leaks);
  if (!leaksByDefault(qualLeaks.walletAddress)) {
    return [];
  }
  const linkables: WalletAddressLinkableTo[] = [];
  const qualRefs = refs(leaks);
  for (const info of leakedInfos) {
    if (leakedInfoType(info) !== LeakedInfoType.PERSONAL_DATA) {
      continue;
    }
    if (!leaksByDefault(qualLeaks[info])) {
      continue;
    }
    linkables.push({ info, leak: qualLeaks[info], refs: qualRefs });
  }
  return linkables;
}

export const addressCorrelation: Attribute<AddressCorrelationValue> = {
  id: 'address_correlation',
  icon: '\u{1f517}', // Link
  displayName: 'Wallet address privacy',
  question: sentence(`
    Is your wallet address linkable to other information about yourself?
  `),
  why: paragraph(`
    Your wallet address is unique and permanent, which makes it easy for
    applications and companies like Chainalysis to track your activity.
    In web-privacy terms, it is worse than cookies: its record is permanent,
    publicly visible, and even tracks across multiple devices and websites.
    The more personal information is linkable to your wallet address, the
    more effective such tracking can be.
    It is therefore important to use a wallet that does its best to protect
    your information from being linked to your wallet address.
  `),
  explanationValues: [
    uncorrelated,
    linkable([
      {
        info: LeakedPersonalInfo.IP_ADDRESS,
        leak: Leak.BY_DEFAULT,
        by: exampleNodeCompany,
        refs: [],
      },
    ]).value,
    linkable(
      nonEmptyMap(
        [LeakedPersonalInfo.PHONE, LeakedPersonalInfo.CEX_ACCOUNT, LeakedPersonalInfo.IP_ADDRESS],
        leakInfo => ({
          info: leakInfo,
          leak: Leak.BY_DEFAULT,
          by: exampleCex,
          refs: [],
        })
      )
    ).value,
  ],
  evaluate: (features: ResolvedFeatures): Evaluation<AddressCorrelationValue> => {
    if (features.privacy.dataCollection === null) {
      return unrated(addressCorrelation, brand, null);
    }
    const linkables: WalletAddressLinkableBy[] = [];
    for (const collected of features.privacy.dataCollection.collectedByEntities) {
      for (const linkable of linkableToWalletAddress(collected.leaks)) {
        linkables.push({ by: collected.entity, ...linkable });
      }
    }
    for (const linkable of linkableToWalletAddress({
      ...features.privacy.dataCollection.onchain,
      walletAddress: Leak.ALWAYS,
    })) {
      linkables.push({ by: 'onchain', ...linkable });
    }
    if (isNonEmptyArray(linkables)) {
      return linkable(linkables);
    }
    return {
      value: uncorrelated,
      details: paragraph(
        ({ wallet }) => `
          ${wallet.metadata.displayName} does not allow any third-party to link
          your wallet address to any personal information.
        `
      ),
    };
  },
  aggregate: pickWorstRating<AddressCorrelationValue>,
};
