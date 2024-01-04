import { type Info } from '@/types/Info';

export const blocto: Info = {
  url: 'https://blocto.io/',
  submittedByName: '@timmmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '02/01/2024',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  mobile: {
    accountType: '4337',
    chainCompatibility: {
      configurable: true,
      autoswitch: false,
      ethereum: true,
      polygon: true,
      arbitrum: true,
      avalanche: true,
      base: false,
      bnbSmartChain: true,
      gnosis: false,
      optimism: true,
    },
    ensCompatibility: {
      mainnet: true,
      subDomains: false,
      offchain: false,
      L2s: false,
      customDomains: false,
      freeUsernames: false,
    },
    backupOptions: {
      cloud: false,
      local: false,
      socialRecovery: true,
    },
    securityFeatures: {
      multisig: false,
      MPC: false,
      keyRotation: false,
      transactionScanning: false,
      limitsAndTimelocks: false,
      hardwareWalletSupport: false,
    },
    availableTestnets: {
      availableTestnets: false,
    },
    license: 'OPEN_SOURCE',
    connectionMethods: {
      walletConnect: true,
      injected: false,
      embedded: false,
      inappBrowser: true,
    },
    modularity: {
      modularity: false,
    },
  },
};
