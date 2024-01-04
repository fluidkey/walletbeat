import { type Info } from '@/types/Info';

export const _1inch: Info = {
  url: 'https://1inch.io/',
  submittedByName: '@timmmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '02/01/2024',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
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
      transactionScanning: false,
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
      inappBrowser: true,
    },
    modularity: {
      modularity: false,
    },
  },
};
