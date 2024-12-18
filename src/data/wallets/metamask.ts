import type { Info } from '@/types/Info';

export const metamask: Info = {
  url: 'https://metamask.io/',
  submittedByName: '@moritz',
  submittedByUrl: 'https://warpcast.com/moritz/',
  updatedAt: '11/12/2023',
  updatedByName: '@kien-ngo',
  updatedByUrl: 'https://github.com/kien-ngo',
  repoUrl: 'https://github.com/MetaMask',
  mobile: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      optimism: true,
      arbitrum: true,
      base: true,
      polygon: true,
      gnosis: false,
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
    license: 'SOURCE_AVAILABLE',
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
  browser: {
    accountType: 'EOA',
    chainCompatibility: {
      configurable: true,
      autoswitch: true,
      ethereum: true,
      optimism: true,
      arbitrum: true,
      base: true,
      polygon: true,
      gnosis: false,
      bnbSmartChain: true,
      avalanche: true,
    },
    ensCompatibility: {
      mainnet: true,
      subDomains: true,
      offchain: true,
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
      transactionScanning: true,
      limitsAndTimelocks: false,
      hardwareWalletSupport: true,
    },
    availableTestnets: {
      availableTestnets: true,
    },
    license: 'SOURCE_AVAILABLE',
    connectionMethods: {
      walletConnect: false,
      injected: true,
      embedded: false,
      inappBrowser: false,
    },
    modularity: {
      modularity: true,
    },
  },
  issues: {
    ensCompatibility: {
      L2s: ['https://github.com/MetaMask/metamask-extension/issues/18648'],
    },
  },
};
