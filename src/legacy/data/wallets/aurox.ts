import type { Info } from '@/legacy/types/Info'

export const aurox: Info = {
	url: 'https://getaurox.com/',
	submittedByName: '@timmykwesi',
	submittedByUrl: 'https://warpcast.com/timmykwesi',
	updatedAt: '29/12/2023',
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
			gnosis: false,
			bnbSmartChain: true,
			avalanche: true,
		},
		ensCompatibility: {
			mainnet: true,
			subDomains: true,
			offchain: false,
			L2s: false,
			customDomains: false,
			freeUsernames: true,
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
			availableTestnets: false,
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
