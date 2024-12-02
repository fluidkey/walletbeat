export type AccountType = 'EOA' | '4337' | 'SAFE';
export type License = 'OPEN_SOURCE' | 'SOURCE_AVAILABLE' | 'PROPRIETARY';

export interface Features {
  accountType: AccountType;
  chainCompatibility: {
    configurable: boolean;
    autoswitch: boolean;
    ethereum: boolean;
    optimism: boolean;
    arbitrum: boolean;
    base: boolean;
    polygon: boolean;
    gnosis: boolean;
    bnbSmartChain: boolean;
    avalanche: boolean;
  };
  ensCompatibility: {
    mainnet: boolean;
    subDomains: boolean;
    offchain: boolean;
    L2s: boolean;
    customDomains: boolean;
    freeUsernames: boolean;
  };
  backupOptions: {
    cloud: boolean;
    local: boolean;
    socialRecovery: boolean;
  };
  securityFeatures: {
    multisig: boolean;
    MPC: boolean;
    keyRotation: boolean;
    transactionScanning: boolean;
    limitsAndTimelocks: boolean;
    hardwareWalletSupport: boolean;
  };
  availableTestnets: {
    availableTestnets: boolean;
  };
  license: License;
  connectionMethods: {
    walletConnect: boolean;
    injected: boolean;
    embedded: boolean;
    inappBrowser: boolean;
  };
  modularity: {
    modularity: boolean;
  };
}
