export interface Features {
  deviceCompatibility: {
    mobile: boolean;
    desktop: boolean;
    browser: boolean;
  };
  accountType: {
    eoa: boolean;
    erc4337: boolean;
    safe: boolean;
  };
  chainCompatibility: {
    ethereum: boolean;
    optimism: boolean;
    arbitrum: boolean;
    base: boolean;
    polygon: boolean;
    zora: boolean;
    gnosis: boolean;
    bnbSmartChain: boolean;
  };
  ensCompatibility: {
    mainnet: boolean;
    subDomains: boolean;
    offchain: boolean;
    L2s: boolean;
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
  walletConnect: {
    compatible: boolean;
  };
}
