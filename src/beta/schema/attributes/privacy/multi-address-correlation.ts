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
import { paragraph, sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';

const brand = 'attributes.privacy.multi_address_correlation';
export type MultiAddressCorrelationValue = Value & {
  __brand: 'attributes.privacy.multi_address_correlation';
};

const uniqueDestinations: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'unique_destinations',
    rating: Rating.YES,
    icon: '\u{26d3}', // Broken chain
    displayName: 'Wallet uses unique endpoints per address',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
      ${walletMetadata.displayName} uses unique endpoints for each wallet address, which keeps them uncorrelated.
    `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      When configured with multiple addresses, ${wallet.metadata.displayName}
      uses unique RPC endpoints for each wallet address. Therefore, no single
      RPC endpoint gets to learn about more than one of your addresses.
    `
  ),
};

const activeAddressOnly: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'active_address_only',
    rating: Rating.YES,
    icon: '\u{1f4ce}', // Single paperclip
    displayName: 'Wallet only handles one active address at a time',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} only makes requests about one active
        address at a time, so it can't be correlated with other addresses.
      `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} only has one active address at a time, and
      all outgoing RPC requests are only about that address.
      Additionally, the account switching UI does not perform bulk queries
      about all configured addresses in close succession.
    `
  ),
  impact: paragraph(
    ({ wallet }) => `
      Multi-address privacy is generally well-preserved by
      ${wallet.metadata.displayName}.
      However, you should avoid quickly switching between active addresses
      in order to avoid making successive requests to the same RPC endpoint
      about different addresses.
    `
  ),
};

const correlated: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'correlated',
    rating: Rating.NO,
    displayName: 'Multiple addresses are correlatable by a third party',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} makes requests about multiple addresses
        simultaneously to the same endpoint, which allows it to correlate your
        addresses.
      `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
    When configured with multiple addresses, ${wallet.metadata.displayName}
    makes requests that contain multiple addresses simultaneously.
  `
  ),
  impact: paragraph(
    ({ wallet }) => `
      Using multiple addresses in ${wallet.metadata.displayName} will allow
      them to be correlated by a third-party.
      You should avoid configuring multiple addresses with
      ${wallet.metadata.displayName}.
    `
  ),
  howToImprove: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} should first ensure that it never makes
      requests containing multiple addresses simultaneously.
      Next, it should ensure that these requests are staggered and are proxied
      through different proxies and RPC endpoints to prevent correlation.
      This can be done through the use of privacy solutions such as
      Oblivious HTTP, Tor, and others.
    `
  ),
};

const staggeredRequests: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'staggered_requests',
    rating: Rating.PARTIAL,
    displayName: 'Requests for multiple addresses are staggered across time',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} staggers requests about multiple addresses
        over time time, which makes it harder to correlate your addresses.
      `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      When configured with multiple addresses, ${wallet.metadata.displayName}
      makes requests that contain only one of your addresses at a time.
      While each of these requests go to the same endpoint, they are staggered
      over time.
      Depending on the delay between such requests, this can provide an
      imperfect degree of privacy, as this makes it harder for the endpoint
      to correlate these requests as coming from the same user due to the
      time elapsed between the requests.
      However, since these requests are still unproxied, the endpoint is still
      able to correlate the requests due to their identical origin IP address.
    `
  ),
  howToImprove: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} should ensure requests are proxied
      through distinct proxies in order to prevent the RPC endpoint from
      learning the correlation between addresses. This can be done through
      the use of privacy solutions such as Oblivious HTTP, Tor, and others.
    `
  ),
};

const separateCircuits: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'separate_circuits',
    rating: Rating.PARTIAL,
    displayName: 'Requests for multiple addresses use separate proxies',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} uses distinct proxies to make requests
        about multiple addresses, which makes it harder to correlate your
        addresses.
      `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      When configured with multiple addresses, ${wallet.metadata.displayName}
      makes requests that contain only one of your addresses at a time.
      While each of these requests go to the same endpoint, they each use a
      different proxy circuit in order to appear as coming from different IPs
      from the perspective of the endpoint.
      This provides an imperfect degree of privacy, as it makes it harder for
      the endpoint to correlate these requests as coming from the same user.
      However, since these requests are all made together simultaneously,
      the endpoint is still able to correlate them by grouping them across
      time.
    `
  ),
  howToImprove: paragraph(
    ({ wallet }) => `
      ${wallet.metadata.displayName} should add randomized delays between
      refreshes of separate addresses in order to reduce time-based
      correlatability of addresses by the RPC endpoint.
    `
  ),
};

const staggeredAndSeparateCircuits: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'staggered_and_separate_circuits',
    rating: Rating.YES,
    icon: '\u{26d3}', // Broken chain
    displayName: 'Requests for multiple addresses are uncorrelated',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        ${walletMetadata.displayName} uses distinct proxies and staggers
        requests about multiple addresses over time, which makes it harder
        to correlate your addresses.
      `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      When configured with multiple addresses, ${wallet.metadata.displayName}
      makes requests that contain only one of your addresses at a time.
      While each of these requests go to the same endpoint, they each use a
      different proxy circuit in order to appear as coming from different IPs
      from the perspective of the endpoint, and they are staggered over time.
      This provides a good degree of privacy, as it makes it harder for the
      endpoint to correlate these requests as coming from the same user.
      From the perspective of the endpoint, these requests come in from random
      IPs at random times, avoiding both IP-based and time-based correlation.
    `
  ),
};

const unsupported: Evaluation<MultiAddressCorrelationValue> = {
  value: {
    id: 'unsupported',
    rating: Rating.UNRATED,
    icon: '\u{1f4ce}', // Single paperclip
    displayName: 'Multiple addresses unsupported',
    shortExplanation: sentence(
      (walletMetadata: WalletMetadata) => `
        You can only use one address in ${walletMetadata.displayName}.
      `
    ),
    __brand: brand,
  },
  details: paragraph(
    ({ wallet }) => `
      You can only use one address in ${wallet.metadata.displayName}, so
      multi-address privacy is irrelevant.
    `
  ),
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
  id: 'multiAddressCorrelation',
  icon: '\u{1f587}', // Linked paperclips
  displayName: 'Multi-address privacy',
  question: sentence(`
    Can a third-party learn that your various wallet addresses belong to the same person?
  `),
  why: paragraph(`
    You probably have more than one wallet address configured in your wallet,
    which you use for different purposes and perhaps as different identities.
    These wallet addresses all belong to you, but you would rather keep that
    fact private.
    It is therefore important to use a wallet that does not reveal that fact.
  `),
  explanationValues: [
    activeAddressOnly.value,
    separateCircuits.value,
    staggeredRequests.value,
    correlated.value,
  ],
  evaluate: (features: ResolvedFeatures): Evaluation<MultiAddressCorrelationValue> => {
    if (features.multiAddress === null) {
      return unrated(multiAddressCorrelation, brand, null);
    }
    if (!features.multiAddress) {
      return unsupported;
    }
    if (features.privacy.dataCollection === null) {
      return unrated(multiAddressCorrelation, brand, null);
    }
    let worstHandling: EntityData | null = null;
    let worstHandlingScore = -1;
    for (const collected of features.privacy.dataCollection.collectedByEntities) {
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
      return unrated(multiAddressCorrelation, brand, null);
    }
    if (worstHandling.leaks.multiAddress === undefined) {
      return unrated(multiAddressCorrelation, brand, null);
    }
    const handling = worstHandling.leaks.multiAddress;
    switch (handling.type) {
      case MultiAddressPolicy.ACTIVE_ADDRESS_ONLY:
        // If the wallet has a concept of a singular "active address" and only
        // ever makes requests about it, then other addresses are never exposed
        // and therefore not correlatable.
        return activeAddressOnly;
      case MultiAddressPolicy.SINGLE_REQUEST_WITH_MULTIPLE_ADDRESSES:
        // If the wallet makes a single request with multiple addresses,
        // they are clearly correlatable.
        return correlated;
      case MultiAddressPolicy.SEPARATE_REQUEST_PER_ADDRESS:
        if (handling.destination === 'ISOLATED') {
          // The wallet makes requests to different endpoints for each
          // address, so they are not correlatable.
          return uniqueDestinations;
        }
        if (handling.proxy === 'SEPARATE_CIRCUITS' && handling.timing === 'STAGGERED') {
          // The wallet mitigates correlation both at the network level and by
          // time. Not correlated.
          return staggeredAndSeparateCircuits;
        }
        if (handling.proxy === 'SEPARATE_CIRCUITS' && handling.timing !== 'STAGGERED') {
          // Requests not staggered, but coming from different IPs.
          // Better than nothing.
          return separateCircuits;
        }
        if (handling.proxy !== 'SEPARATE_CIRCUITS' && handling.timing === 'STAGGERED') {
          // Requests staggered, but coming from the same IP.
          // Better than nothing.
          return staggeredRequests;
        }
        // Requests not staggered, and all coming from the same IP.
        // That is correlated.
        return correlated;
    }
  },
  aggregate: pickWorstRating<MultiAddressCorrelationValue>,
};
