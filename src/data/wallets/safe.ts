import { type Info } from '@/types/Info';

export const safe: Info = {
  url: 'https://app.safe.global/',
  submittedByName: '@moritz',
  submittedByUrl: 'https://warpcast.com/moritz/',
  updatedAt: '11/12/2023',
  updatedByName: '@kien-ngo',
  updatedByUrl: 'https://github.com/kien-ngo',
  mobile: {
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
      local: true,
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
      availableTestnets: true,
    },
    license: 'OPEN_SOURCE',
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
      local: true,
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
      availableTestnets: true,
    },
    license: 'OPEN_SOURCE',
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
