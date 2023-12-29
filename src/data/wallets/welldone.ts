import { type Info } from '@/types/Info';

export const welldone: Info = {
  url: 'https://welldonestudio.io/',
  submittedByName: '@timmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '29/12/2023',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  browser: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: false,
      ethereum: true,
      optimism: false,
      arbitrum: false,
      base: false,
      polygon: false,
      gnosis: false,
      bnbSmartChain: false,
      avalanche: false,
    },
    ensCompatibility: {
      mainnet: false,
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
      transactionScanning: false,
      limitsAndTimelocks: false,
      hardwareWalletSupport: true,
    },
    availableTestnets: {
      availableTestnets:true,
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
