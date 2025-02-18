import type { Info } from '@/legacy/types/Info'

export const enjin: Info = {
	url: 'https://enjin.io/',
	submittedByName: '@timmmykwesi',
	submittedByUrl: 'https://warpcast.com/timmykwesi',
	updatedAt: '02/01/2024',
	updatedByName: '@timmykwesi',
	updatedByUrl: 'https://warpcast.com/timmykwesi',
	mobile: {
		accountType: 'EOA',
		chainCompatibility: {
			configurable: true,
			autoswitch: false,
			ethereum: true,
			polygon: true,
			arbitrum: false,
			avalanche: false,
			base: false,
			bnbSmartChain: true,
			gnosis: false,
			optimism: false,
		},
		ensCompatibility: {
			mainnet: true,
			subDomains: false,
			offchain: false,
			L2s: true,
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
			walletConnect: true,
			injected: false,
			embedded: false,
			inappBrowser: true,
		},
		modularity: {
			modularity: false,
		},
	},
}
