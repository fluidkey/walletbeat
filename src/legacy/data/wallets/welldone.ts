import type { Info } from '@/legacy/types/Info';

export const welldone: Info = {
  url: 'https://welldonestudio.io/',
  submittedByName: '@timmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '29/12/2023',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  browser: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: false,
      autoswitch: false,
      ethereum: true,
      optimism: true,
      arbitrum: true,
      base: false,
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
      transactionScanning: false,
      limitsAndTimelocks: false,
      hardwareWalletSupport: true,
    },
    availableTestnets: {
      availableTestnets: true,
    },
    license: 'PROPRIETARY',
    connectionMethods: {
      walletConnect: false,
      injected: true,
      embedded: false,
      inappBrowser: false,
    },
    modularity: {
      modularity: false,
    },
  },
};
