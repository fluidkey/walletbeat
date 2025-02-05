import type { Info } from '@/legacy/types/Info';

export const gemwallet: Info = {
  url: 'https://gemwallet.com',
  submittedByName: '@0xh3rman',
  submittedByUrl: 'https://twitter.com/0xh3rman',
  updatedAt: '19/12/2023',
  updatedByName: '@0xh3rman',
  updatedByUrl: 'https://twitter.com/0xh3rman',
  mobile: {
    accountType: 'EOA',
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
