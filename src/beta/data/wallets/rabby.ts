import { Leak, MultiAddressPolicy } from '@/beta/schema/features/privacy/data-collection';
import { deBank } from '../entities/debank';
import { polymutex } from '../contributors/polymutex';
import { paragraph } from '@/beta/types/text';
import type { Wallet } from '@/beta/schema/wallet';
import { License } from '@/beta/schema/features/license';
import { WalletProfile } from '@/beta/schema/features/profile';
import { RpcEndpointConfiguration } from '@/beta/schema/features/chain-configurability';

export const rabby: Wallet = {
  metadata: {
    id: 'rabby',
    displayName: 'Rabby',
    iconExtension: 'svg',
    blurb: paragraph(`
        Rabby is a user-friendly Ethereum wallet focusing on smooth UX and security.
        It features an intuitive transaction preview feature and works on many chains.
      `),
    url: 'https://rabby.io',
    repoUrl: 'https://github.com/RabbyHub/Rabby',
    contributors: [polymutex],
    lastUpdated: '2024-12-15',
  },
  features: {
    profile: WalletProfile.GENERIC,
    multiAddress: true,
    chainConfigurability: {
      l1RpcEndpoint: RpcEndpointConfiguration.YES_AFTER_OTHER_REQUESTS,
      otherRpcEndpoints: RpcEndpointConfiguration.YES_AFTER_OTHER_REQUESTS,
      customChains: true,
    },
    integration: {
      browser: {
        '1193': true,
        '2700': true,
        '6963': true,
        ref: [
          {
            url: 'https://github.com/RabbyHub/Rabby/blob/develop/src/background/utils/buildinProvider.ts',
            explanation:
              'Rabby implements the EIP-1193 Provider interface and injects it into web pages. EIP-2700 and EIP-6963 are also supported.',
          },
        ],
      },
    },
    security: {
      lightClient: {
        ethereumL1: {
          helios: false,
        },
      },
    },
    privacy: {
      dataCollection: {
        browser: {
          onchain: {},
          collectedByEntities: [
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
                    explanation: 'All wallet traffic goes through api.rabby.io without proxying.',
                    url: 'https://github.com/RabbyHub/Rabby/blob/356ed60957d61d508a89d71c63a33b7474d6b311/src/constant/index.ts#L468',
                  },
                  {
                    explanation:
                      'Rabby uses self-hosted Matomo Analytics to track user actions. While this tracking data does not contain wallet addresses, it goes to DeBank-owned servers much like Ethereum RPC requests do. This puts DeBank in a position to link user actions with wallet addresses through IP address correlation.',
                    url: 'https://github.com/search?q=repo%3ARabbyHub%2FRabby%20matomoRequestEvent&type=code',
                  },
                  {
                    explanation: 'Balance refresh requests are made about the active address only.',
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
            {
              label: 'Series A',
              url: 'https://www.crunchbase.com/funding_round/debank-series-a--65945a04',
            },
            {
              label: 'Series B',
              url: 'https://www.crunchbase.com/funding_round/debank-series-b--44225a21',
            },
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
