import { Leak, MultiAddressPolicy } from '@/beta/schema/features/privacy/data-collection';
import type { Wallet } from '@/beta/schema/wallet';
import { License } from '@/beta/schema/features/license';
import { daimoInc } from '../entities/daimo';
import { binance } from '../entities/binance';
import { openExchangeRates } from '../entities/open-exchange-rates';
import { polymutex } from '../contributors/polymutex';
import { paragraph } from '@/beta/types/text';
import { merkleManufactory } from '../entities/merkle-manufactory';
import { pimlico } from '../entities/pimlico';
import { honeycomb } from '../entities/honeycomb';

export const daimo: Wallet = {
  metadata: {
    id: 'daimo',
    displayName: 'Daimo',
    iconExtension: 'svg',
    blurb: paragraph(`
      Daimo aims to replicate a Venmo-like experience onchain.
      It focuses on cheap stablecoin payments and fast onramp and
      offramp of USD / USDC with minimal fees.
    `),
    pseudonymType: {
      singular: 'Daimo username',
      plural: 'Daimo usernames',
    },
    url: 'https://daimo.com',
    repoUrl: 'https://github.com/daimo-eth/daimo',
    contributors: [polymutex],
    lastUpdated: '2024-12-15',
  },
  features: {
    multiAddress: true,
    privacy: {
      dataCollection: {
        onchain: {
          pseudonym: Leak.ALWAYS,
          ref: {
            explanation:
              "Creating a Daimo wallet creates a transaction publicly registering your name and address in Daimo's nameRegistry contract on Ethereum.",
            url: 'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/packages/daimo-api/src/contract/nameRegistry.ts#L183-L197',
          },
        },
        collectedByEntities: [
          {
            entity: daimoInc,
            leaks: {
              ipAddress: Leak.ALWAYS,
              walletAddress: Leak.ALWAYS,
              multiAddress: {
                type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY,
              },
              mempoolTransactions: Leak.ALWAYS,
              pseudonym: Leak.ALWAYS,
              ref: {
                explanation:
                  'Wallet operations are routed through Daimo.com servers without proxying.',
                url: 'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/packages/daimo-api/src/network/viemClient.ts#L35-L50',
              },
            },
          },
          {
            entity: pimlico,
            leaks: {
              ipAddress: Leak.ALWAYS,
              walletAddress: Leak.ALWAYS,
              multiAddress: {
                type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY,
              },
              mempoolTransactions: Leak.ALWAYS,
              ref: {
                explanation:
                  'Sending bundled transactions uses the Pimlico API via api.pimlico.io as Paymaster.',
                url: [
                  'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/packages/daimo-api/src/network/bundlerClient.ts#L131-L133',
                ],
              },
            },
          },
          {
            entity: honeycomb,
            leaks: {
              ipAddress: Leak.ALWAYS,
              walletAddress: Leak.ALWAYS,
              multiAddress: {
                type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY,
              },
              pseudonym: Leak.ALWAYS,
              ref: {
                explanation:
                  'Daimo records telemetry events to Honeycomb. This data includes your Daimo username. Since this username is also linked to your wallet address onchain, Honeycomb can associate the username they receive with your wallet address.',
                url: [
                  'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/packages/daimo-api/src/server/telemetry.ts#L101-L111',
                ],
              },
            },
          },
          {
            entity: daimoInc,
            leaks: {
              farcasterAccount: Leak.OPT_IN,
              ref: [
                {
                  explanation:
                    'Users may opt to link their Farcaster profile to their Daimo profile.',
                  url: 'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/apps/daimo-mobile/src/view/sheet/FarcasterBottomSheet.tsx#L141-L148',
                },
              ],
            },
          },
          {
            entity: binance,
            leaks: {
              ipAddress: Leak.OPT_IN,
              walletAddress: Leak.OPT_IN,
              multiAddress: {
                type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY,
              },
              cexAccount: Leak.OPT_IN,
              ref: [
                {
                  explanation:
                    "Users may deposit from Binance Pay, after which Binance will learn the user's wallet address.",
                  url: 'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/packages/daimo-api/src/network/binanceClient.ts#L132',
                },
              ],
            },
          },
          {
            entity: openExchangeRates,
            leaks: {
              ipAddress: Leak.ALWAYS,
              ref: [
                {
                  explanation:
                    'The wallet refreshes fiat currency exchange rates periodically. Such requests do not carry wallet identifying information.',
                  url: [
                    'https://github.com/daimo-eth/daimo/blob/072e57d700ba8d2e932165a12c2741c31938f1c2/packages/daimo-api/src/api/getExchangeRates.ts',
                    'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/packages/daimo-api/.env.example#L6',
                  ],
                },
              ],
            },
          },
          {
            entity: merkleManufactory,
            leaks: {
              ipAddress: Leak.OPT_IN,
              ref: [
                {
                  explanation:
                    'Users may opt to link their Farcaster profile to their Daimo profile.',
                  url: 'https://github.com/daimo-eth/daimo/blob/e1ddce7c37959d5cec92b05608ce62f93f3316b7/apps/daimo-mobile/src/view/sheet/FarcasterBottomSheet.tsx#L141-L148',
                },
              ],
            },
          },
        ],
      },
      privacyPolicy: 'https://daimo.com/privacy',
    },
    license: License.GPL_3_0,
    monetization: {
      revenueBreakdownIsPublic: false,
      strategies: {
        selfFunded: false,
        donations: false,
        ecosystemGrants: true,
        publicOffering: false,
        ventureCapital: true,
        transparentConvenienceFees: false,
        hiddenConvenienceFees: false,
        governanceTokenLowFloat: false,
        governanceTokenMostlyDistributed: false,
      },
      ref: [
        {
          explanation: 'Daimo is funded by venture capital.',
          url: 'https://www.crunchbase.com/funding_round/daimo-seed--8722ae6a',
        },
        {
          explanation: 'Daimo has received grant funding from the Ethereum Foundation.',
          url: 'https://blog.ethereum.org/2024/02/20/esp-allocation-q423',
        },
        {
          explanation:
            'Daimo has received grant funding from Optimism RetroPGF Round 3 for its P256Verifier contract.',
          url: 'https://vote.optimism.io/retropgf/3/application/0x118a000851cf4c736497bab89993418517ac7cd9c8ede074aff408a8e0f84060',
        },
      ],
    },
  },
  overrides: {
    attributes: {
      privacy: {
        addressCorrelation: {
          note: paragraph(`
            Daimo usernames are user-selected during signup, and can be set
            to any pseudonym. Daimo provides functionality to randomize its
            value. To preserve privacy, it is recommended to pick a random
            value that is not related to any of your existing usernames.
            Doing so effectively preserves the pseudonymous nature of wallet
            addresses.
          `),
        },
      },
    },
  },
  variants: {
    mobile: true,
    browser: false,
    desktop: false,
  },
};
