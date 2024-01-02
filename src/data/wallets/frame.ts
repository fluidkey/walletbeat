import { type Info } from '@/types/Info';

export const frame: Info = {
  url: 'https://frame.sh/',
  submittedByName: '@zakimzf',
  submittedByUrl: 'https://github.com/zakimzf',
  updatedAt: '02/01/2024',
  updatedByName: '@zakimzf',
  updatedByUrl: 'https://github.com/zakimzf',
  mobile: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: false,
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
    license: 'OPEN_SOURCE',
    connectionMethods: {
      walletConnect: false,
      injected: false,
      embedded: true,
      inappBrowser: true,
    },
    modularity: {
      modularity: false,
    },
  },
};
