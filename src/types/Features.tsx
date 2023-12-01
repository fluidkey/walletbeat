export interface Features {
  deviceCompatibility: {
    mobile: boolean;
    desktop: boolean;
    browserExtension: boolean;
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
    googleDrive: boolean;
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
    goerli: boolean;
    sepolia: boolean;
  };
}
