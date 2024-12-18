import { Leak, MultiAddressPolicy } from '@/schema/features/privacy/data-collection';
import type { Wallet } from '@/schema/wallet';
import { License } from '@/schema/features/license';
import { daimo } from '../entities/daimo';
import { binance } from '../entities/binance';
import { openExchangeRates } from '../entities/open-exchange-rates';
import { polymutex } from '../contributors/polymutex';
import { paragraph } from '@/types/text';

export const daimoBeta: Wallet = {
  metadata: {
    id: 'daimo',
    displayName: 'Daimo',
    iconExtension: 'svg',
    blurb: paragraph(`
      Daimo aims to replicate a Venmo-like experience onchain.
      It focuses on cheap stablecoin payments and fast onramp and
      offramp of USD / USDC with minimal fees.
    `),
    url: 'https://daimo.com',
    repoUrl: 'https://github.com/daimo-eth/daimo',
    contributors: [polymutex],
    lastUpdated: '2024-12-15',
  },
  features: {
    multiAddress: true,
    privacy: {
      dataCollection: {
        collected: [
          {
            entity: daimo,
            leaks: {
              ipAddress: Leak.ALWAYS,
              walletAddress: Leak.ALWAYS,
              multiAddress: {
                type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY,
              },
              mempoolTransactions: Leak.ALWAYS,
              pseudonym: Leak.ALWAYS,
              ref: [
                {
                  explanation:
                    'Balance refresh requests are made about one address at a time only, with no proxying nor staggering.',
                  url: 'https://github.com/RabbyHub/Rabby/blob/356ed60957d61d508a89d71c63a33b7474d6b311/src/background/controller/wallet.ts#L1622',
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
                  url: 'https://github.com/daimo-eth/daimo/blob/072e57d700ba8d2e932165a12c2741c31938f1c2/packages/daimo-api/src/api/getExchangeRates.ts',
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
  variants: {
    mobile: true,
    browser: false,
    desktop: false,
  },
};
