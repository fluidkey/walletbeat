import { type Info } from '@/types/Info';

export const frame: Info = {
  url: 'https://frame.sh/',
  submittedByName: '@timmykwesi',
  submittedByUrl: 'https://warpcast.com/timmykwesi',
  updatedAt: '02/01/2023',
  updatedByName: '@timmykwesi',
  updatedByUrl: 'https://warpcast.com/timmykwesi',
  desktop: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      optimism: true,
      arbitrum: true,
      base: true,
      polygon: true,
      gnosis: true,
      bnbSmartChain: false,
      avalanche: false,
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
