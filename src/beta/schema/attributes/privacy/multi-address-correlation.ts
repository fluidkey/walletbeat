import type { ResolvedFeatures } from '@/beta/schema/features';
import { Rating, type Value, type Attribute, type Evaluation } from '@/beta/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import {
  type EntityData,
  inferLeaks,
  leaksByDefault,
  type MultiAddressHandling,
  MultiAddressPolicy,
} from '@/beta/schema/features/privacy/data-collection';
import { sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';

const brand = 'attributes.privacy.multi_address_correlation';
export type MultiAddressCorrelationValue = Value & {
  __brand: 'attributes.privacy.multi_address_correlation';
};

const uniqueDestinations: MultiAddressCorrelationValue = {
  id: 'unique_destinations',
  rating: Rating.YES,
  icon: '\u{26d3}', // Broken chain
  displayName: 'Wallet uses unique endpoints per address',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `When configured with multiple addresses, ${walletMetadata.displayName} uses unique endpoints for each of them which keeps them uncorrelated.`
  ),
  __brand: brand,
};

const activeAddressOnly: MultiAddressCorrelationValue = {
  id: 'active_address_only',
  rating: Rating.YES,
  icon: '\u{1f4ce}', // Single paperclip
  displayName: 'Wallet only handles one active address at a time',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} only makes requests about one active address at a time, so it can't be correlated with other addresses.`
  ),
  __brand: brand,
};

const correlated: MultiAddressCorrelationValue = {
  id: 'correlated',
  rating: Rating.NO,
  displayName: 'Multiple addresses are correlatable by a third party',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} makes requests about multiple addresses simultaneously to the same endpoint, which allows it to correlate your addresses.`
  ),
  __brand: brand,
};

const staggeredRequests: MultiAddressCorrelationValue = {
  id: 'staggered_requests',
  rating: Rating.PARTIAL,
  displayName: 'Requests for multiple addresses are staggered across time',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} staggers requests about multiple addresses over time time, which makes it harder to correlate your addresses.`
  ),
  __brand: brand,
};

const separateCircuits: MultiAddressCorrelationValue = {
  id: 'separate_circuits',
  rating: Rating.PARTIAL,
  displayName: 'Requests for multiple addresses use separate proxies',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} uses distinct proxies to make requests about multiple addresses, which makes it harder to correlate your addresses.`
  ),
  __brand: brand,
};

const staggeredAndSeparateCircuits: MultiAddressCorrelationValue = {
  id: 'staggered_and_separate_circuits',
  rating: Rating.YES,
  icon: '\u{26d3}', // Broken chain
  displayName: 'Requests for multiple addresses are uncorrelated',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} uses distinct proxies and staggers requests about multiple addresses over time, which makes it harder to correlate your addresses.`
  ),
  __brand: brand,
};

const unsupported: MultiAddressCorrelationValue = {
  id: 'unsupported',
  rating: Rating.UNRATED,
  icon: '\u{1f4ce}', // Single paperclip
  displayName: 'Multiple addresses unsupported',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) =>
      `${walletMetadata.displayName} does not support multiple addresses.`
  ),
  __brand: brand,
};

function rateHandling(handling: MultiAddressHandling): number {
  switch (handling.type) {
    case MultiAddressPolicy.SINGLE_REQUEST_WITH_MULTIPLE_ADDRESSES:
      return 0;

    case MultiAddressPolicy.ACTIVE_ADDRESS_ONLY:
      return 1000;
    case MultiAddressPolicy.SEPARATE_REQUEST_PER_ADDRESS: {
      const destinationScore = { SAME_FOR_ALL: 0, ISOLATED: 1 }[handling.destination] * 100;
      const proxyScore = { NONE: 0, SAME_CIRCUIT: 1, SEPARATE_CIRCUITS: 2 }[handling.proxy] * 10;
      const timingScore = { SIMULTANEOUS: 0, STAGGERED: 1 }[handling.timing];
      return 1 + destinationScore + proxyScore + timingScore;
    }
  }
}

export const multiAddressCorrelation: Attribute<MultiAddressCorrelationValue> = {
  id: 'multi_address',
  icon: '\u{1f587}', // Linked paperclips
  displayName: 'Multi-address privacy',
  explanationValues: [activeAddressOnly, separateCircuits, staggeredRequests, correlated],
  evaluate: (features: ResolvedFeatures): Evaluation<MultiAddressCorrelationValue> => {
    if (features.multiAddress === null) {
      return { value: unrated(multiAddressCorrelation, brand) };
    }
    if (!features.multiAddress) {
      return { value: unsupported };
    }
    if (features.privacy.dataCollection === null) {
      return { value: unrated(multiAddressCorrelation, brand) };
    }
    let worstHandling: EntityData | null = null;
    let worstHandlingScore = -1;
    for (const collected of features.privacy.dataCollection.collected) {
      const leaks = inferLeaks(collected.leaks);
      if (!leaksByDefault(leaks.walletAddress)) {
        continue;
      }
      if (leaks.multiAddress === undefined) {
        continue;
      }
      const score = rateHandling(leaks.multiAddress);
      if (worstHandling === null || score < worstHandlingScore) {
        worstHandling = collected;
        worstHandlingScore = score;
      }
    }
    if (worstHandling === null) {
      return { value: unrated(multiAddressCorrelation, brand) };
    }
    if (worstHandling.leaks.multiAddress === undefined) {
      return { value: unrated(multiAddressCorrelation, brand) };
    }
    const handling = worstHandling.leaks.multiAddress;
    switch (handling.type) {
      case MultiAddressPolicy.ACTIVE_ADDRESS_ONLY:
        // If the wallet has a concept of a singular "active address" and only
        // ever makes requests about it, then other addresses are never exposed
        // and therefore not correlatable.
        return { value: activeAddressOnly };
      case MultiAddressPolicy.SINGLE_REQUEST_WITH_MULTIPLE_ADDRESSES:
        // If the wallet makes a single request with multiple addresses,
        // they are clearly correlatable.
        return { value: correlated };
      case MultiAddressPolicy.SEPARATE_REQUEST_PER_ADDRESS:
        if (handling.destination === 'ISOLATED') {
          // The wallet makes requests to different endpoints for each
          // address, so they are not correlatable.
          return { value: uniqueDestinations };
        }
        if (handling.proxy === 'SEPARATE_CIRCUITS' && handling.timing === 'STAGGERED') {
          // The wallet mitigates correlation both at the network level and by
          // time. Not correlated.
          return { value: staggeredAndSeparateCircuits };
        }
        if (handling.proxy === 'SEPARATE_CIRCUITS' && handling.timing !== 'STAGGERED') {
          // Requests not staggered, but coming from different IPs.
          // Better than nothing.
          return { value: separateCircuits };
        }
        if (handling.proxy !== 'SEPARATE_CIRCUITS' && handling.timing === 'STAGGERED') {
          // Requests staggered, but coming from the same IP.
          // Better than nothing.
          return { value: staggeredRequests };
        }
        // Requests not staggered, and all coming from the same IP.
        // That is correlated.
        return { value: correlated };
    }
  },
  aggregate: pickWorstRating<MultiAddressCorrelationValue>,
};
