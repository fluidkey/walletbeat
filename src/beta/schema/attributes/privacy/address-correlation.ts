import type { ResolvedFeatures } from '@/beta/schema/features';
import { Rating, type Value, type Attribute, type Evaluation } from '@/beta/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import { inferLeaks, leaksByDefault } from '@/beta/schema/features/privacy/data-collection';
import { sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';

const brand = 'attributes.privacy.address_correlation';
export type AddressCorrelationValue = Value & {
  __brand: 'attributes.privacy.address_correlation';
};

const uncorrelated: AddressCorrelationValue = {
  id: 'no_correlation',
  rating: Rating.YES,
  icon: '\u{26d3}', // Broken chain
  displayName: 'Wallet address is kept private',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} keeps your wallet address private.`
  ),
  __brand: brand,
};

function correlated(what: string, rating: Rating): AddressCorrelationValue {
  return {
    id: `address_and_${what.toLowerCase()}`,
    rating,
    displayName: `Wallet address is linkable to ${what}`,
    walletExplanation: sentence(
      (walletMetadata: WalletMetadata) =>
        `${walletMetadata.displayName} allows a third party to correlate your address and ${what}.`
    ),
    __brand: brand,
  };
}

export const addressCorrelation: Attribute<AddressCorrelationValue> = {
  id: 'address_correlation',
  icon: '\u{1f517}', // Link
  displayName: 'Wallet address privacy',
  explanationValues: [
    uncorrelated,
    correlated('IP', Rating.PARTIAL),
    correlated('phone', Rating.NO),
  ],
  evaluate: (features: ResolvedFeatures): Evaluation<AddressCorrelationValue> => {
    if (features.privacy.dataCollection === null) {
      return { value: unrated(addressCorrelation, brand) };
    }
    for (const collected of features.privacy.dataCollection.collected) {
      const leaks = inferLeaks(collected.leaks);
      if (!leaksByDefault(leaks.walletAddress)) {
        continue;
      }
      for (const { name, leak } of [
        { name: 'ID', leak: leaks.govId },
        { name: 'physical address', leak: leaks.physicalAddress },
        { name: 'face', leak: leaks.face },
        { name: 'phone', leak: leaks.phone },
        { name: 'email', leak: leaks.email },
        { name: 'name', leak: leaks.legalName },
        { name: 'IP', leak: leaks.ipAddress },
        { name: 'pseudonym', leak: leaks.pseudonym },
      ]) {
        if (leak >= leaks.walletAddress) {
          return {
            value: correlated(
              name,
              name === 'IP' || name === 'pseudonym' ? Rating.PARTIAL : Rating.NO
            ),
          };
        }
      }
    }
    return { value: uncorrelated };
  },
  aggregate: pickWorstRating<AddressCorrelationValue>,
};
