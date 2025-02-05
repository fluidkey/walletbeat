import type { Info } from '@/legacy/types/Info';

export const ambire: Info = {
  url: 'https://ambire.com',
  submittedByName: '@jordan-enev',
  submittedByUrl: 'https://github.com/jordan-enev',
  updatedAt: '24/01/2025',
  updatedByName: '@superKalo',
  updatedByUrl: 'https://github.com/superkalo',
  browser: {
    accountType: '4337',
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
      mainnet: true,
      subDomains: true,
      offchain: false,
      L2s: true,
      customDomains: true,
      freeUsernames: true,
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
