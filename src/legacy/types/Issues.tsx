export interface Issues {
	chainCompatibility?: {
		configurable?: string[]
		autoswitch?: string[]
		ethereum?: string[]
		optimism?: string[]
		arbitrum?: string[]
		base?: string[]
		polygon?: string[]
		gnosis?: string[]
		bnbSmartChain?: string[]
		avalanche?: string[]
	}
	ensCompatibility?: {
		mainnet?: string[]
		subDomains?: string[]
		offchain?: string[]
		L2s?: string[]
		customDomains?: string[]
		freeUsernames?: string[]
	}
	backupOptions?: {
		cloud?: string[]
		local?: string[]
		socialRecovery?: string[]
	}
	securityFeatures?: {
		multisig?: string[]
		MPC?: string[]
		keyRotation?: string[]
		transactionScanning?: string[]
		limitsAndTimelocks?: string[]
		hardwareWalletSupport?: string[]
	}
	availableTestnets?: {
		availableTestnets?: string[]
	}
	connectionMethods?: {
		walletConnect?: string[]
		injected?: string[]
		embedded?: string[]
		inappBrowser?: string[]
	}
	modularity?: {
		modularity?: string[]
	}
}
