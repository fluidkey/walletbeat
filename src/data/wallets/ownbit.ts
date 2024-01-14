import { type Info } from '@/types/Info';

export const ownbit: Info = {
  name: 'Ownbit',
  url: 'https://ownbit.io/',
  submittedByName: '@timmmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '04/01/2024',
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
      avalanche: false,
      base: false,
      bnbSmartChain: true,
      gnosis: false,
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
      cloud: false,
      local: true,
      socialRecovery: false,
    },
    securityFeatures: {
      multisig: true,
      MPC: false,
      keyRotation: false,
      transactionScanning: false,
      limitsAndTimelocks: false,
      hardwareWalletSupport: false,
    },
    availableTestnets: {
      availableTestnets: false,
    },
    license: 'PROPRIETARY',
    connectionMethods: {
      walletConnect: false,
      injected: false,
      embedded: false,
      inappBrowser: false,
    },
    modularity: {
      modularity: false,
    },
  },
};
