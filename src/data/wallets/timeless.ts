import { type Info } from '@/types/Info';

export const timeless: Info = {
  url: 'https://timelesswallet.xyz/',
  submittedByName: '@timmmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '04/01/2024',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  mobile: {
    accountType: '4337',
    chainCompatibility: {
      configurable: false,
      autoswitch: false,
      ethereum: true,
      polygon: false,
      arbitrum: false,
      avalanche: false,
      base: false,
      bnbSmartChain: false,
      gnosis: false,
      optimism: false,
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
