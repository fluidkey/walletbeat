import type { Info } from '@/legacy/types/Info';

export const obvious: Info = {
  url: 'https://obvious.technology/',
  submittedByName: '@jebui',
  submittedByUrl: 'https://warpcast.com/jebui/',
  updatedAt: '11/12/2023',
  updatedByName: '@kien-ngo',
  updatedByUrl: 'https://github.com/kien-ngo',
  mobile: {
    accountType: '4337',
    chainCompatibility: {
      configurable: false,
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
      mainnet: true,
      subDomains: true,
      offchain: true,
      L2s: true,
      customDomains: true,
      freeUsernames: true,
    },
    backupOptions: {
      cloud: false,
      local: true,
      socialRecovery: true,
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
      availableTestnets: false,
    },
    license: 'PROPRIETARY',
    connectionMethods: {
      walletConnect: true,
      injected: false,
      embedded: false,
      inappBrowser: false,
    },
    modularity: {
      modularity: false,
    },
  },
};
