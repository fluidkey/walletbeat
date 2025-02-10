import { paragraph } from '@/types/content';
import type { Wallet } from '@/schema/wallet';
import { WalletProfile } from '@/schema/features/profile';
import type { WithRef } from '@/schema/reference';
import type { EthereumL1LightClient } from '@/schema/features/security/light-client';
import { polymutex } from '../contributors/polymutex';

export const metamask: Wallet = {
  metadata: {
    id: 'metamask',
    displayName: 'Metamask',
    iconExtension: 'svg',
    blurb: paragraph(`
      MetaMask is a popular Ethereum wallet created by Consensys and that has
      been around for a long time. It is a jack-of-all-trades wallet that can
      be extended through MetaMask Snaps.
    `),
    url: 'https://metamask.io',
    repoUrl: 'https://github.com/MetaMask/metamask-extension',
    contributors: [polymutex],
    lastUpdated: '2025-02-08',
  },
  features: {
    profile: WalletProfile.GENERIC,
    multiAddress: true,
    chainConfigurability: null,
    addressResolution: {
      nonChainSpecificEnsResolution: null,
      chainSpecificAddressing: {
        erc7828: null,
        erc7831: null,
      },
      ref: null,
    },
    integration: {
      browser: {
        '1193': null,
        '2700': null,
        '6963': null,
        ref: null,
      },
    },
    security: {
      publicSecurityAudits: null,
      lightClient: {
        ethereumL1: {
          helios: null,
          heliosMobi: null,
          ref: null,
        } satisfies WithRef<Record<EthereumL1LightClient, boolean | null>>,
      },
    },
    privacy: {
      dataCollection: null,
      privacyPolicy: 'https://consensys.io/privacy-notice',
    },
    selfSovereignty: {
      transactionSubmission: {
        l1: {
          selfBroadcastViaDirectGossip: null,
          selfBroadcastViaSelfHostedNode: null,
        },
        l2: {
          arbitrum: null,
          opStack: null,
        },
      },
    },
    license: null,
    monetization: {
      revenueBreakdownIsPublic: false,
      strategies: {
        selfFunded: null,
        donations: null,
        ecosystemGrants: null,
        publicOffering: null,
        ventureCapital: null,
        transparentConvenienceFees: null,
        hiddenConvenienceFees: null,
        governanceTokenLowFloat: null,
        governanceTokenMostlyDistributed: null,
      },
      ref: null,
    },
  },
  variants: {
    mobile: true,
    browser: true,
    desktop: false,
    embedded: false,
  },
};
