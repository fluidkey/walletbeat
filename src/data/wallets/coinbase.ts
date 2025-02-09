import { paragraph } from '@/types/content';
import type { Wallet } from '@/schema/wallet';
import { WalletProfile } from '@/schema/features/profile';
import type { WithRef } from '@/schema/reference';
import type { EthereumL1LightClient } from '@/schema/features/security/light-client';
import { polymutex } from '../contributors/polymutex';

export const coinbase: Wallet = {
  metadata: {
    id: 'coinbase',
    displayName: 'Coinbase',
    iconExtension: 'svg',
    blurb: paragraph(`
      Coinbase Wallet is a self-custodial wallet built by Coinbase. It
      integrates with Coinbase exchange accounts to bring them onchain.
    `),
    url: 'https://www.coinbase.com/wallet',
    repoUrl: null,
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
      privacyPolicy: 'https://wallet.coinbase.com/privacy-policy',
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
