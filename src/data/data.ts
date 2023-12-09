import { type Info } from '@/types/Info';

export const wallets: Record<string, Info> = {
  Metamask: {
    url: 'https://metamask.io/',
    mobile: {
      accountType: 'EOA',
      chainCompatibility: {
        configurable: true,
        autoswitch: false,
        ethereum: true,
        optimism: true,
        arbitrum: true,
        base: false,
        polygon: true,
        gnosis: false,
        bnbSmartChain: true,
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
      // TO-DO
      accountType: 'EOA',
      chainCompatibility: {
        configurable: true,
        autoswitch: false,
        ethereum: true,
        optimism: true,
        arbitrum: true,
        base: false,
        polygon: true,
        gnosis: false,
        bnbSmartChain: true,
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
        walletConnect: true,
        injected: false,
        embedded: false,
        inappBrowser: true,
      },
      modularity: {
        modularity: true,
      },
    },
  },
};
