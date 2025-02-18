import type { Info } from '@/legacy/types/Info'

export const uniswap: Info = {
	url: 'https://wallet.uniswap.org/',
	submittedByName: '@slobo.eth',
	submittedByUrl: 'https://warpcast.com/slobo.eth/',
	updatedAt: '11/12/2023',
	updatedByName: '@kien-ngo',
	updatedByUrl: 'https://github.com/kien-ngo',
	mobile: {
		accountType: 'EOA',
		chainCompatibility: {
			configurable: false,
			autoswitch: true,
			ethereum: true,
			optimism: true,
			arbitrum: true,
			base: true,
			polygon: true,
			gnosis: false,
			bnbSmartChain: true,
			avalanche: false,
		},
		ensCompatibility: {
			mainnet: true,
			subDomains: true,
			offchain: true,
			L2s: false,
			customDomains: true,
			freeUsernames: false,
		},
		backupOptions: {
			cloud: true,
			local: true,
			socialRecovery: false,
		},
		securityFeatures: {
			multisig: false,
			MPC: false,
			keyRotation: false,
			transactionScanning: false,
			limitsAndTimelocks: false,
			hardwareWalletSupport: false,
		},
		availableTestnets: {
			availableTestnets: false,
		},
		license: 'OPEN_SOURCE',
		connectionMethods: {
			walletConnect: true,
			injected: false,
			embedded: false,
			inappBrowser: false,
		},
		modularity: {
			modularity: false,
		},
	},
}
