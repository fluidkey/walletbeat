import type { Info } from '@/legacy/types/Info'

export const block: Info = {
	url: 'https://blockwallet.io/',
	submittedByName: '@timmykwesi',
	submittedByUrl: 'https://warpcast.com/timmykwesi',
	updatedAt: '02/01/2024',
	updatedByName: '@timmykwesi',
	updatedByUrl: 'https://warpcast.com/timmykwesi',
	browser: {
		accountType: 'EOA',
		chainCompatibility: {
			configurable: true,
			autoswitch: false,
			ethereum: true,
			optimism: true,
			arbitrum: true,
			base: false,
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
			socialRecovery: false,
		},
		securityFeatures: {
			multisig: false,
			MPC: false,
			keyRotation: false,
			transactionScanning: false,
			limitsAndTimelocks: false,
			hardwareWalletSupport: true,
		},
		availableTestnets: {
			availableTestnets: true,
		},
		license: 'OPEN_SOURCE',
		connectionMethods: {
			walletConnect: false,
			injected: true,
			embedded: false,
			inappBrowser: false,
		},
		modularity: {
			modularity: false,
		},
	},
}
