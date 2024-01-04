import { type Info } from '@/types/Info';

export const unstoppable: Info = {
  url: 'https://unstoppable.money/',
  submittedByName: '@timmmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '04/01/2024',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  mobile: {
    accountType: '4337',
    chainCompatibility: {
      configurable: false,
      autoswitch: true,
      ethereum: true,
      polygon: true,
      arbitrum: true,
      avalanche: true,
      base: false,
      bnbSmartChain: true,
      gnosis: true,
      optimism: true,
    },
    ensCompatibility: {
      mainnet: true,
      subDomains: true,
      offchain: false,
      L2s: true,
      customDomains: false,
      freeUsernames: false,
    },
    backupOptions: {
      cloud: true,
      local: true,
      socialRecovery: false,
    },
    securityFeatures: {
      multisig: false,
      MPC: false,
      keyRotation: false,
      transactionScanning: true,
      limitsAndTimelocks: true,
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
      inappBrowser: false,
    },
    modularity: {
      modularity: false,
    },
  },
};
