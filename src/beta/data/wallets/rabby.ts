import { Leak, MultiAddressPolicy } from '@/beta/schema/features/privacy/data-collection';
import { deBank } from '../entities/debank';
import { polymutex } from '../contributors/polymutex';
import { paragraph } from '@/beta/types/text';
import type { Wallet } from '@/beta/schema/wallet';
import { License } from '@/beta/schema/features/license';

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
