import type { Info } from '@/types/Info';

export const den: Info = {
  url: 'https://onchainden.com/',
  submittedByName: '@jierlich',
  submittedByUrl: 'https://warpcast.com/jierlich',
  updatedAt: '12/12/2023',
  updatedByName: '@jierlich',
  updatedByUrl: 'https://warpcast.com/jierlich',
  browser: {
    accountType: 'SAFE',
    chainCompatibility: {
      configurable: false,
      autoswitch: false,
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
      L2s: false,
      customDomains: false,
      freeUsernames: false,
    },
    backupOptions: {
      cloud: false,
      local: false,
      socialRecovery: true,
    },
    securityFeatures: {
      multisig: true,
      MPC: false,
      keyRotation: true,
      transactionScanning: true,
      limitsAndTimelocks: true,
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
      inappBrowser: false,
    },
    modularity: {
      modularity: true,
    },
  },
};
