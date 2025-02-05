import type { Info } from '@/legacy/types/Info';

export const talisman: Info = {
  url: 'https://talisman.xyz',
  submittedByName: '@chidg',
  submittedByUrl: 'https://github.com/chidg',
  updatedAt: '01/08/2025',
  updatedByName: '@chidg',
  updatedByUrl: 'https://github.com/chidg',
  browser: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      polygon: true,
      arbitrum: true,
      avalanche: true,
      base: true,
      bnbSmartChain: true,
      gnosis: true,
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
      socialRecovery: false,
    },
    securityFeatures: {
      multisig: false,
      MPC: false,
      keyRotation: false,
      transactionScanning: true,
      limitsAndTimelocks: true,
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
