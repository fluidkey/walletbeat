import { Features } from "@/types/Features";

export const wallets: { [name: string]: Features } = {
  'Super Wallet': {
    deviceCompatibility: {
      mobile: true,
      desktop: true,
      browserExtension: true,
    },
    accountType: {
      eoa: true,
      erc4337: false,
      safe: false,
    },
    chainCompatibility: {
      ethereum: true,
      optimism: false,
      arbitrum: false,
      base: false,
      polygon: true,
      zora: false,
      gnosis: false,
      bnbSmartChain: false,
    },
    ensCompatibility: {
      mainnet: true,
      subDomains: true,
      offchain: false,
      L2s: false,
    },
    backupOptions: {
      googleDrive: false,
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
      goerli: true,
      sepolia: false,
    },
  },
  'ABC Wallet': {
    deviceCompatibility: {
      mobile: true,
      desktop: false,
      browserExtension: false,
    },
    accountType: {
      eoa: true,
      erc4337: false,
      safe: false,
    },
    chainCompatibility: {
      ethereum: true,
      optimism: false,
      arbitrum: false,
      base: false,
      polygon: true,
      zora: false,
      gnosis: false,
      bnbSmartChain: false,
    },
    ensCompatibility: {
      mainnet: true,
      subDomains: true,
      offchain: false,
      L2s: false,
    },
    backupOptions: {
      googleDrive: true,
      local: false,
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
      goerli: true,
      sepolia: false,
    },
  },
};