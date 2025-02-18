import type { Info } from '@/legacy/types/Info'

export const klever: Info = {
	url: 'https://klever.io/',
	submittedByName: '@timmmykwesi',
	submittedByUrl: 'https://warpcast.com/timmykwesi',
	updatedAt: '02/12/2023',
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
			mainnet: false,
			subDomains: false,
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
			availableTestnets: false,
		},
		license: 'PROPRIETARY',
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
