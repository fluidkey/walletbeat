import { Features } from "@/types/Features";
import { Info } from "@/types/Info";

export const wallets: { [name: string]: Features & Info } = {
  'Super Wallet': {
    url: 'https://test.io',
    deviceCompatibility: {
      mobile: true,
      desktop: true,
      browser: true,
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
      availableTestnets: true
    },
    walletConnect: {
      compatible: true,
    },
  },
  'ABC Wallet': {
    url: 'https://test.io',
    deviceCompatibility: {
      mobile: true,
      desktop: false,
      browser: false,
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
      cloud: true,
      local: false,
      socialRecovery: false,
    },
    securityFeatures: {
      multisig: false,
      MPC: false,
      keyRotation: true,
      transactionScanning: true,
      limitsAndTimelocks: false,
      hardwareWalletSupport: true,
    },
    availableTestnets: {
      availableTestnets: true
    },
    walletConnect: {
      compatible: false,
    },
  },
};