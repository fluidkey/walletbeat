import type { Info } from '@/legacy/types/Info';

export const frame: Info = {
  url: 'https://frame.sh/',
  submittedByName: '@zakimzf',
  submittedByUrl: 'https://github.com/zakimzf',
  updatedAt: '02/01/2024',
  updatedByName: '@zakimzf',
  updatedByUrl: 'https://github.com/zakimzf',
  desktop: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      polygon: true,
      arbitrum: true,
      avalanche: false,
      base: true,
      bnbSmartChain: false,
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
      embedded: true,
      inappBrowser: false,
    },
    modularity: {
      modularity: false,
    },
  },
};
