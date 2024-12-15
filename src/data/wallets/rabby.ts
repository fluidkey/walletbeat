import { Leak, MultiAddressPolicy } from '@/schema/features/privacy/data-collection';
import type { Wallet } from '@/schema/wallet';
import type { Info } from '@/types/Info';
import { deBank } from '../entities/debank';
import { License } from '@/schema/features/license';
import { polymutex } from '../contributors';

export const rabby: Info = {
  url: 'https://rabby.io/',
  submittedByName: '@timmmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '04/01/2024',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  browser: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      optimism: true,
      arbitrum: true,
      base: true,
      polygon: true,
      gnosis: true,
      bnbSmartChain: true,
      avalanche: true,
    },
    ensCompatibility: {
      mainnet: false,
      subDomains: false,
      offchain: false,
      L2s: false,
      customDomains: false,
      freeUsernames: false,
    },
    backupOptions: {
      cloud: false,
      local: true,
      socialRecovery: false,
    },
    securityFeatures: {
      multisig: false,
      MPC: false,
      keyRotation: false,
      transactionScanning: true,
      limitsAndTimelocks: false,
      hardwareWalletSupport: true,
    },
    availableTestnets: {
      availableTestnets: true,
    },
    license: 'OPEN_SOURCE',
    connectionMethods: {
      walletConnect: true,
      injected: true,
      embedded: false,
      inappBrowser: false,
    },
    modularity: {
      modularity: false,
    },
  },
  desktop: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      optimism: true,
      arbitrum: true,
      base: true,
      polygon: true,
      gnosis: true,
      bnbSmartChain: true,
      avalanche: true,
    },
    ensCompatibility: {
      mainnet: false,
      subDomains: false,
      offchain: false,
      L2s: false,
      customDomains: false,
      freeUsernames: false,
    },
    backupOptions: {
      cloud: false,
      local: false,
      socialRecovery: false,
    },
    securityFeatures: {
      multisig: false,
      MPC: false,
      keyRotation: false,
      transactionScanning: true,
      limitsAndTimelocks: false,
      hardwareWalletSupport: true,
    },
    availableTestnets: {
      availableTestnets: true,
    },
    license: 'OPEN_SOURCE',
    connectionMethods: {
      walletConnect: true,
      injected: false,
      embedded: true,
      inappBrowser: true,
    },
    modularity: {
      modularity: false,
    },
  },
};

export const rabbyBeta: Wallet = {
  metadata: {
    id: 'rabby',
    displayName: 'Rabby',
    iconExtension: 'svg',
    url: 'https://rabby.io',
    repoUrl: 'https://github.com/RabbyHub/Rabby',
    contributors: [polymutex],
    lastUpdated: '2024-12-15',
  },
  features: {
    multiAddress: true,
    privacy: {
      dataCollection: {
        browser: {
          collected: [
            {
              // The code refers to this by `api.rabby.io`, but Rabby is wholly owned by DeBank.
              entity: deBank,
              leaks: {
                ipAddress: Leak.ALWAYS,
                walletAddress: Leak.ALWAYS,
                multiAddress: {
                  type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY,
                },
                mempoolTransactions: Leak.ALWAYS,
                cexAccount: Leak.NEVER, // There appears to be code to link to a Coinbase account but no way to reach it from the UI?
                ref: [
                  {
                    explanation: 'Rabby uses self-hosted Matomo Analytics to track user actions.',
                    url: 'https://github.com/search?q=repo%3ARabbyHub%2FRabby%20matomoRequestEvent&type=code',
                  },
                  {
                    explanation: 'All wallet traffic goes through api.rabby.io without proxying.',
                    url: 'https://github.com/RabbyHub/Rabby/blob/356ed60957d61d508a89d71c63a33b7474d6b311/src/constant/index.ts#L468',
                  },
                  {
                    explanation:
                      'Balance refresh requests are made about one address at a time, with no proxying nor staggering between requests.',
                    url: 'https://github.com/RabbyHub/Rabby/blob/356ed60957d61d508a89d71c63a33b7474d6b311/src/background/controller/wallet.ts#L1622',
                  },
                ],
              },
            },
          ],
        },
      },
      privacyPolicy: 'https://rabby.io/docs/privacy',
    },
    license: {
      browser: License.MIT,
      desktop: License.MIT,
      mobile: License.UNLICENSED_VISIBLE,
    },
    monetization: {
      revenueBreakdownIsPublic: false,
      strategies: {
        selfFunded: false,
        donations: false,
        ecosystemGrants: false,
        publicOffering: false,
        ventureCapital: true,
        transparentConvenienceFees: true, // Swap fees
        hiddenConvenienceFees: false,
        governanceTokenLowFloat: false,
        governanceTokenMostlyDistributed: false,
      },
      ref: [
        {
          explanation: 'Rabby is owned by DeBank, which is funded by venture capital.',
          url: [
            'https://www.crunchbase.com/funding_round/debank-series-a--65945a04',
            'https://www.crunchbase.com/funding_round/debank-series-b--44225a21',
          ],
        },
      ],
    },
  },
  variants: {
    mobile: true,
    browser: true,
    desktop: true,
  },
};
