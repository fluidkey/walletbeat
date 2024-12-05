import { License } from '@/schema/features/license';
import { type Entity, InferLeaks, Leak } from '@/schema/features/privacy/data-collection';
import type { Wallet } from '@/schema/wallet';

const FictitiousPriceTracker: Entity = {
  name: 'Some price tracking service',
  jurisdiction: 'Some jurisdiction',
  url: 'https://crypto.prices.lol',
  privacyPolicy: 'https://crypto.prices.lol/privacy',
};

const FictitiousNodeService: Entity = {
  name: 'Some node service',
  jurisdiction: 'Some jurisdiction',
  url: 'https://give-me-geth.ninja',
  privacyPolicy: 'https://give-me-geth.ninja/privacy',
};

export const NotARealWallet: Wallet = {
  info: {
    url: 'https://some.cool.url',
    submittedByName: 'A fictitious character',
    submittedByUrl: 'https://a.fictitious.site',
    updatedAt: 'some date',
    updatedByName: 'A fictitious character',
    updatedByUrl: 'https://a.fictitious.site',
    repoUrl: 'https://github.com/fictitiouscorp/not-a-real-wallet',
  },
  variants: {
    browser: true,
    mobile: true,
    desktop: false,
  },
  features: {
    license: License.MIT,
    privacy: {
      dataCollection: {
        browser: {
          collected: [
            {
              entity: FictitiousNodeService,
              leaks: InferLeaks({
                ipAddress: Leak.BY_DEFAULT,
                walletAddress: Leak.BY_DEFAULT,
              }),
            },
            {
              entity: FictitiousPriceTracker,
              leaks: InferLeaks({
                ipAddress: Leak.BY_DEFAULT,
                walletAssets: Leak.BY_DEFAULT,
              }),
            },
          ],
        },
        mobile: {
          collected: [
            {
              entity: FictitiousNodeService,
              leaks: InferLeaks({
                ipAddress: Leak.ALWAYS,
                walletAddress: Leak.ALWAYS,
              }),
            },
            {
              entity: FictitiousPriceTracker,
              leaks: InferLeaks({
                ipAddress: Leak.BY_DEFAULT,
                walletAssets: Leak.BY_DEFAULT,
              }),
            },
          ],
        },
      },
      privacyPolicy: 'https://some.cool.url/privacy',
    },
  },
};
