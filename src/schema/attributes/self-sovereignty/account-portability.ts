import type { ResolvedFeatures } from '@/schema/features'
import {
	Rating,
	type Value,
	type Attribute,
	type Evaluation,
	exampleRating,
} from '@/schema/attributes'
import { pickWorstRating, unrated } from '../common'
import { markdown, mdParagraph, paragraph, sentence } from '@/types/content'
import type { WalletMetadata } from '@/schema/wallet'
import {
	AccountType,
	isAccountTypeSupported,
	TransactionGenerationCapability,
	type AccountSupport,
	type AccountType7702,
	type AccountTypeEoa,
	type AccountTypeMpc,
	type AccountTypeMutableMultifactor,
} from '@/schema/features/account-support'
import { isNonEmptyArray, nonEmptyGet } from '@/types/utils/non-empty'
import { eipMarkdownLink } from '@/schema/eips'
import { erc4337 } from '@/data/eips/erc-4337'
import { eip7702 } from '@/data/eips/eip-7702'

const brand = 'attributes.self_sovereignty.account_portability'
export type AccountPortabilityValue = Value & {
	__brand: 'attributes.self_sovereignty.account_portability'
}

function evaluateEoa(eoa: AccountTypeEoa): Evaluation<AccountPortabilityValue> {
	if (
		eoa.keyDerivation.type === 'BIP32' &&
		eoa.keyDerivation.seedPhrase === 'BIP39' &&
		eoa.keyDerivation.derivationPath === 'BIP44'
	) {
		const canExportSeedPhrase = eoa.keyDerivation.canExportSeedPhrase
		return {
			value: {
				id: 'standard_eoa_exportable',
				rating: Rating.PASS,
				displayName: 'Standards-compliant EOA with seed phrase',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} follows EOA key derivation standards.
					`,
				),
				__brand: brand,
			},
			details: mdParagraph(
				({ wallet }) => `
					${wallet.metadata.displayName} generates EOA keys in a
					standards-compliant way:
					
					* [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
						for deriving a binary seed from a seed phrase.
					* [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
						for deterministic hierarchical key derivation from the binary seed.
					* [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
						as a standard when deriving hierarchical private keys.
					${
						canExportSeedPhrase
							? `
					In addition, seed phrases are exportable so that they can be
					imported into other wallets. This ensures your account is portable
					and avoids lock-in.
						`
							: ''
					}
				`,
			),
		}
	}
	if (eoa.canExportPrivateKey) {
		return {
			value: {
				id: 'nonstandard_eoa_exportable',
				rating: Rating.PARTIAL,
				displayName: 'Non-standard but exportable EOA',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} does not follow key derivation
					standards for EOA keys, but lets you export them to other wallets.
				`,
				),
				__brand: brand,
			},
			details: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} generates EOA keys in a non-standard
					way. However, these keys can be exported into other wallets,
					avoiding lock-in.
				`,
			),
			impact: paragraph(
				({ wallet }) => `
					Using ${wallet.metadata.displayName} requires keeping backups of
					your keys in order to ensure portability of your account down the
					line.
				`,
			),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should follow key derivation
					standards to avoid requiring users to back up each private key.
				`,
			),
		}
	}
	return {
		value: {
			id: 'no_export_eoa',
			rating: Rating.FAIL,
			icon: '\u{1faa4}', // Mouse trap
			displayName: 'Cannot export account key',
			shortExplanation: sentence(
				(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} locks you in by not
					allowing you to export your account's private key.
				`,
			),
			__brand: brand,
		},
		details: paragraph(
			({ wallet }) => `
				${wallet.metadata.displayName} does not allow you to export your
				account's private key.
			`,
		),
		impact: paragraph(
			({ wallet }) => `
				Using ${wallet.metadata.displayName} locks you into it,
				as you cannot export your account into another wallet.
			`,
		),
		howToImprove: paragraph(
			({ wallet }) => `
				${wallet.metadata.displayName} should let users export private keys.
			`,
		),
	}
}

function evaluateMpc(mpc: AccountTypeMpc): Evaluation<AccountPortabilityValue> {
	if (mpc.controllingSharesInSelfCustodyByDefault === 'NO') {
		return {
			value: {
				id: 'mpc_no_controlling_shares',
				rating: Rating.FAIL,
				icon: '\u{1faa4}', // Mouse trap
				displayName: 'Non-custodial MPC shares',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						By default, users of ${walletMetadata.displayName} do not
						custody enough shares of the account's private key to control
						it.
					`,
				),
				__brand: brand,
			},
			details: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} is an MPC wallet, with the private
					key split up into multiple shares. By default, the user does not
					custody enough shares of this private key in order to control the
					account. Therefore, ${wallet.metadata.displayName} is not a
					self-custodial wallet.
				`,
			),
			impact: paragraph(
				({ wallet }) => `
					Users of ${wallet.metadata.displayName} do not have unilateral
					control over their account, and need to rely on a third-party to
					authorize transactions or transfer assets out of the account.
				`,
			),
			howToImprove: mdParagraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should provide a way for users to
					obtain enough key shares in self-custody such that users no longer
					*need* to rely on third parties for transactions.
				`,
			),
		}
	}
	if (
		mpc.tokenTransferTransactionGeneration ===
		TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API
	) {
		return {
			value: {
				id: 'mpc_cannot_transfer',
				rating: Rating.FAIL,
				icon: '\u{1faa4}', // Mouse trap
				displayName: 'Cannot withdraw assets without third party',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						Withdrawing assets out of ${walletMetadata.displayName} cannot be
						done without relying on a third party.
					`,
				),
				__brand: brand,
			},
			details: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} is an MPC wallet, with the private
					key split up into multiple shares. The user owns enough shares to
					fully own the account, but generating an asset withdrawal
					transaction nonetheless requires interaction with a third-party.
				`,
			),
			impact: paragraph(
				({ wallet }) => `
					While users of ${wallet.metadata.displayName} have unilateral
					control over their account, the reliance on a third-party to
					generate valid transactions means that transactions can be censored
					by that third-party and effectively freeze the account in place. 
				`,
			),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should release an open-source
					standalone application that allows users to sign transactions
					using their self-custodial key shares.
				`,
			),
		}
	}
	if (
		mpc.tokenTransferTransactionGeneration ===
		TransactionGenerationCapability.USING_PROPRIETARY_STANDALONE_APP
	) {
		return {
			value: {
				id: 'mpc_transfer_proprietary',
				rating: Rating.PARTIAL,
				displayName: 'Requires proprietary app to withdraw assets',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						Withdrawing assets out of ${walletMetadata.displayName} requires
						the use of a proprietary application.
					`,
				),
				__brand: brand,
			},
			details: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} is an MPC wallet, with the private
					key split up into multiple shares. The user owns enough shares to
					fully own the account, but generating an asset withdrawal
					transaction nonetheless requires the use of a proprietary
					application.
				`,
			),
			impact: paragraph(
				({ wallet }) => `
					While users of ${wallet.metadata.displayName} have unilateral
					control over their account, the reliance on a proprietary
					application to generate valid transactions means that the user's
					effective ability to generate transactions may be hampered by
					the limitations of the proprietary application. 
				`,
			),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should release an open-source
					standalone application that allows users to sign transactions
					using their self-custodial key shares.
				`,
			),
		}
	}
	return {
		value: {
			id: 'mpc_ok',
			rating: Rating.PASS,
			displayName: 'Self-custodial MPC wallet',
			shortExplanation: sentence(
				(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} puts the user in control of their MPC
					private key.
				`,
			),
			__brand: brand,
		},
		details: paragraph(
			({ wallet }) => `
				${wallet.metadata.displayName} is an MPC wallet, with the private
				key split up into multiple shares. The user owns enough shares to
				fully control the account, and can generate transactions without
				relying on a third-party.
			`,
		),
	}
}

function evaluateMultifactor(
	multifactor: AccountTypeMutableMultifactor,
	multifactorType: 'erc4337' | 'eip7702',
): Evaluation<AccountPortabilityValue> {
	const eip = multifactorType === 'erc4337' ? erc4337 : eip7702
	if (multifactor.keyRotationTransactionGeneration === TransactionGenerationCapability.IMPOSSIBLE) {
		return {
			value: {
				id: `${multifactorType}_cannot_rotate_authority`,
				rating: Rating.FAIL,
				icon: '\u{1faa4}', // Mouse trap
				displayName: 'Not a self-custodial wallet',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} is not self-custodial, and cannot be
						converted to become self-custodial.
					`,
				),
				__brand: brand,
			},
			details: mdParagraph(
				({ wallet }) => `
					${wallet.metadata.displayName} is an ${eipMarkdownLink(eip)}
					(Smart Contract) wallet. The account control logic in the smart
					contract cannot be updated to put the user fully in control of the
					account.
				`,
			),
			impact: paragraph(
				({ wallet }) => `
				${wallet.metadata.displayName} is not a self-custodial wallet and
				users cannot updated it into one. Users of
				${wallet.metadata.displayName} are therefore not in control of their
				account.
				`,
			),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should update the smart contract
					control logic to allow users to take full control of the account.
				`,
			),
		}
	}
	if (multifactor.controllingSharesInSelfCustodyByDefault === 'NO') {
		if (
			multifactor.keyRotationTransactionGeneration ===
			TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API
		) {
			return {
				value: {
					id: `${multifactorType}_no_control_by_default_and_cannot_change_without_third_party`,
					rating: Rating.FAIL,
					icon: '\u{1faa4}', // Mouse trap
					displayName: 'Not self-custodial by default',
					shortExplanation: sentence(
						(walletMetadata: WalletMetadata) => `
							${walletMetadata.displayName} is not self-custodial by default,
							and changing this requires cooperation from a third-party.
						`,
					),
					__brand: brand,
				},
				details: mdParagraph(
					({ wallet }) => `
						${wallet.metadata.displayName} is an ${eipMarkdownLink(eip)}
						(Smart Contract) wallet. By default, the user does not have the
						ability to unilaterally control the account. Therefore,
						${wallet.metadata.displayName} is not a self-custodial wallet.

						The user *may* update the smart contract control logic such that
						the account becomes effectively self-custodied. However, this process
						requires the cooperation of a third-party and is therefore at risk
						that the third-party prevents this switch from taking place.
					`,
				),
				howToImprove: mdParagraph(
					({ wallet }) => `
						${wallet.metadata.displayName} should either change the smart
						contract's default control configuration such that the account is
						self-custodied by the user from the start, or should release an
						open-source standalone application that allows users to switch
						their account to be effectively self-custodied.
					`,
				),
			}
		}
		if (
			multifactor.keyRotationTransactionGeneration ===
			TransactionGenerationCapability.USING_PROPRIETARY_STANDALONE_APP
		) {
			return {
				value: {
					id: `${multifactorType}_no_control_by_default_and_cannot_change_without_proprietary_app`,
					rating: Rating.FAIL,
					icon: '\u{1faa4}', // Mouse trap
					displayName: 'Not self-custodial by default',
					shortExplanation: sentence(
						(walletMetadata: WalletMetadata) => `
							${walletMetadata.displayName} is not self-custodial by default,
							and changing this requires a proprietary application.
						`,
					),
					__brand: brand,
				},
				details: mdParagraph(
					({ wallet }) => `
						${wallet.metadata.displayName} is an ${eipMarkdownLink(eip)}
						(Smart Contract) wallet. By default, the user does not have the
						ability to unilaterally control the account. Therefore,
						${wallet.metadata.displayName} is not a self-custodial wallet.

						The user *may* update the smart contract control logic such that
						the account becomes effectively self-custodied. However, this process
						requires the use of a proprietary application, and is therefore at
						risk that the application prevents this switch from taking place.
					`,
				),
				howToImprove: mdParagraph(
					({ wallet }) => `
						${wallet.metadata.displayName} should either change the smart
						contract's default control configuration such that the account is
						self-custodied by the user from the start, or should release an
						open-source standalone application that allows users to switch
						their account to be effectively self-custodied.
					`,
				),
			}
		}
	}
	if (
		multifactor.tokenTransferTransactionGeneration ===
		TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API
	) {
		return {
			value: {
				id: `${multifactorType}_cannot_transfer_without_third_party`,
				rating: Rating.FAIL,
				icon: '\u{1faa4}', // Mouse trap
				displayName: 'Cannot withdraw assets without third party',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						Withdrawing assets out of ${walletMetadata.displayName} cannot be
						done without relying on a third party.
					`,
				),
				__brand: brand,
			},
			details: mdParagraph(
				({ wallet }) => `
					Users of ${wallet.metadata.displayName} cannot generate asset
					transfer transactions without relying on a third-party. 
				`,
			),
			impact: paragraph(`
				The reliance on a third-party to generate valid transactions means
				that transactions can be censored by that third-party, opening up
				the risk that the third-party effectively freezes the account in
				place.
			`),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should open-source sufficient
					wallet components such that users can sign and broadcast
					arbitrary transactions without relying on any third party.
				`,
			),
		}
	}
	if (
		multifactor.tokenTransferTransactionGeneration ===
		TransactionGenerationCapability.USING_PROPRIETARY_STANDALONE_APP
	) {
		return {
			value: {
				id: `${multifactorType}_cannot_transfer_proprietary`,
				rating: Rating.FAIL,
				icon: '\u{1faa4}', // Mouse trap
				displayName: 'Requires proprietary app to withdraw assets',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						Withdrawing assets out of ${walletMetadata.displayName} requires
						the use of a proprietary application.
					`,
				),
				__brand: brand,
			},
			details: mdParagraph(
				({ wallet }) => `
					Generating an asset transfer transaction with
					${wallet.metadata.displayName} requires the user of a proprietary
					application. 
				`,
			),
			impact: paragraph(`
				The reliance on a proprietary application to generate valid
				transactions means that the application may opaquely decide to reject
				the generation of certain transactions, opening up the risk that the
				account is effectively frozen in place.
			`),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should open-source sufficient
					wallet components such that users can sign and broadcast
					arbitrary transactions without relying on any third party.
				`,
			),
		}
	}
	if (
		multifactor.controllingSharesInSelfCustodyByDefault === 'NO' &&
		multifactor.keyRotationTransactionGeneration ===
			TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP
	) {
		return {
			value: {
				id: `${multifactorType}_no_control_by_default`,
				rating: Rating.PARTIAL,
				displayName: 'Not self-custodial by default',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} is not self-custodial by default.
					`,
				),
				__brand: brand,
			},
			details: mdParagraph(
				({ wallet }) => `
					${wallet.metadata.displayName} is an ${eipMarkdownLink(erc4337)}
					(Smart Contract) wallet. By default, the user does not have the
					ability to unilaterally control the account. Therefore,
					${wallet.metadata.displayName} is not a self-custodial wallet.
					However, the user *can* update the smart contract control logic to
					turn the account into a self-custodial wallet.
				`,
			),
			howToImprove: mdParagraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should change the smart contract's
					default control configuration such that the account is
					self-custodied by the user from the start.
				`,
			),
		}
	}
	return {
		value: {
			id: `${multifactorType}_ok`,
			rating: Rating.PASS,
			displayName: 'Self-custodial smart wallet',
			shortExplanation: sentence(
				(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} is self-custodial and puts the user in
					control of their smart contract wallet without lock-in.
				`,
			),
			__brand: brand,
		},
		details: mdParagraph(
			({ wallet }) => `
				${wallet.metadata.displayName} is an ${eipMarkdownLink(erc4337)}
				(Smart Contract) wallet. By default, the user holds sufficient
				authority to generate and broadcast arbitrary transactions and can
				do so without relying on a third-party, including transactions
				which update the smart contract's control logic over the account
				(e.g. for key rotation).
			`,
		),
	}
}

function evaluateEip7702(accountSupport: AccountSupport): Evaluation<AccountPortabilityValue> {
	if (!isAccountTypeSupported<AccountType7702>(accountSupport.eip7702)) {
		throw new Error('EIP-7702 account type is not supported')
	}
	const eoaSupport = accountSupport.eoa
	const mpcSupport = accountSupport.mpc
	if (
		!isAccountTypeSupported<AccountTypeEoa>(eoaSupport) &&
		!isAccountTypeSupported<AccountTypeMpc>(mpcSupport)
	) {
		throw new Error('EIP-7702 requires at least one of EOA/MPC account types to be supported')
	}
	// Not implemented yet.
	return unrated(accountPortability, brand, null)
}

export const accountPortability: Attribute<AccountPortabilityValue> = {
	id: 'accountPortability',
	icon: '\u{1f9f3}', // Luggage
	displayName: 'Account portability',
	wording: {
		midSentenceName: 'account portability',
	},
	question: sentence(`
		Are you locked into this wallet?
		Or can you permissionlessly import your Ethereum account into another wallet?
	`),
	why: markdown(`
		Question:
		**What if a wallet's dev team walked away or turned evil one day?**

		One of Ethereum's core promises as an Internet upgrade is to avoid the
		possibility for user lock-in of web2. This is achieved by ensuring
		accounts are permissionlessly portable across wallets.

		Ensuring that accounts remain portable avoids wallets becoming lock-in
		vectors in web3. Permissionless account portability also keeps the wallet
		ecosystem healthy through open competition.
	`),
	methodology: markdown(`
		Wallets are rated based on whether accounts created within can be
		exported out of the wallet and imported into another, without requiring
		permission from the exporter wallet provider.

		For EOA wallets based on private keys, this is relatively straightforward
		to determine. However, for more complex situations such as multisig
		wallets, Walletbeat considers whether such wallets can be made fully
		self-custodial, and whether assets and tokens can be permissionlessly
		transferred out of the wallet.

		Specifically:

		* **EOA wallets** are rated based on the exportability of their private
		  key material, and on whether such private key material is derived using
			the following standards:

			* [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
				for deriving a binary seed from a seed phrase.
			* [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
				for deterministic hierarchical key derivation from the binary seed.
			* [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
				as a standard when deriving hierarchical private keys.

		* **MPC wallets** are rated based on whether the user has a sufficient
			shares of the underlying key to have full control over the wallet in
			a self-custodial manner. Additionally, there must be a way for the user
			to generate a transaction (Walletbeat uses a token transfer out of the
			wallet as the litmus transaction for this) without reliance on a
			third-party API or proprietary application. The combination of these
			factors ensures that the wallet remains self-custodial and that the
			account cannot be frozen in-place due to an uncooperative third party.
		* ${eipMarkdownLink(erc4337)} (smart contract wallets) are rated based on
			the level of control the user has over their account according to the
			smart contract's control logic that the wallet uses. The user must be
			*in control of who controls their account* by default, and be able to
			permissionlessly create asset transfer transactions.  
			Specifically, the rating considers:

			* Whether the user has the ability to change the cryptographic keys
				used to control the account in general, in a manner that does not
				involve relying on a third party or proprietary software.
			* Whether the smart contract wallet's default configuration starts
				out with the user having self-custody of their account, for example
				by having a majority of the key shares in self-custody in a multisig
				wallet.
			* Whether the generation of a token transfer transaction requires
				relying on a third-party or proprietary software, even if the user
				has self-custody of all requisite cryptographic keys to sign such a
				transaction.

		* ${eipMarkdownLink(eip7702)} are not yet rated on account portability and
			will show up as "Unrated".

		If a wallet supports multiple types of accounts, the rating for the account
		type it supports that is *least* portable takes precedence. This makes the
		final rating act as an effective "floor" across the account types the
		wallet supports.

		If a wallet supports multiple types of accounts and all of them have the
		same level of portability, the account type that takes precedence is the
		one that the wallet offers the user to create by default.
	`),
	ratingScale: {
		display: 'fail-pass',
		exhaustive: false,
		fail: [
			exampleRating(
				paragraph(`
					The wallet is an EOA wallet that does not use common seed phrase
					derivation standards for EOA key derivation, and does not allow the
					user to export their private keys.
				`),
				evaluateEoa({
					canExportPrivateKey: false,
					keyDerivation: {
						type: 'NONSTANDARD',
					},
				}).value,
			),
			exampleRating(
				paragraph(`
					The wallet is an MPC wallet where the user does not have
					sufficient key shares under self-custody to unilaterally control
					the account by default.
				`),
				evaluateMpc({
					controllingSharesInSelfCustodyByDefault: 'NO',
					initialKeyGeneration: 'ON_USER_DEVICE',
					tokenTransferTransactionGeneration:
						TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
				}).value,
			),
			exampleRating(
				paragraph(`
					The wallet is an MPC wallet where the user is in self-custody of
					sufficient key shares to unilaterally control the account, but
					cannot generate a token transfer transaction without relying on
					a third party API.
				`),
				evaluateMpc({
					controllingSharesInSelfCustodyByDefault: 'YES',
					initialKeyGeneration: 'ON_USER_DEVICE',
					tokenTransferTransactionGeneration:
						TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
				}).value,
			),
			exampleRating(
				mdParagraph(`
					The wallet is an ${eipMarkdownLink(erc4337)} (smart contract) wallet
					where the control logic of the smart contract is such that the
					user cannot update it to have the user's own private keys as the
					sole controlling keys of the account.
				`),
				evaluateMultifactor(
					{
						controllingSharesInSelfCustodyByDefault: 'YES',
						keyRotationTransactionGeneration: TransactionGenerationCapability.IMPOSSIBLE,
						tokenTransferTransactionGeneration:
							TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
					},
					'erc4337',
				).value,
			),
			exampleRating(
				mdParagraph(`
					The wallet is an ${eipMarkdownLink(erc4337)} (smart contract) wallet
					over which the user does not have full self-custodial control by
					default, and needs to rely on a third-party API or proprietary
					software to modify this.
				`),
				evaluateMultifactor(
					{
						controllingSharesInSelfCustodyByDefault: 'NO',
						keyRotationTransactionGeneration:
							TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
						tokenTransferTransactionGeneration:
							TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
					},
					'erc4337',
				).value,
			),
			exampleRating(
				mdParagraph(`
					The wallet is an ${eipMarkdownLink(erc4337)} (smart contract) wallet
					over which the user has full self-custodial control by default,
					but still needs to rely on a third-party API or proprietary software
					to generate a valid token transfer transaction.
				`),
				evaluateMultifactor(
					{
						controllingSharesInSelfCustodyByDefault: 'YES',
						keyRotationTransactionGeneration:
							TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
						tokenTransferTransactionGeneration:
							TransactionGenerationCapability.RELYING_ON_THIRD_PARTY_API,
					},
					'erc4337',
				).value,
			),
		],
		partial: [
			exampleRating(
				paragraph(`
					The wallet is an EOA wallet that does not use common seed phrase
					derivation standards for EOA key derivation, but does allow the
					user to export private keys so that they can be imported into
					other wallets.
				`),
				evaluateEoa({
					canExportPrivateKey: true,
					keyDerivation: {
						type: 'NONSTANDARD',
					},
				}).value,
			),
			exampleRating(
				paragraph(`
					The wallet is an MPC wallet where the user is in self-custody of
					sufficient key shares to unilaterally control the account, but
					cannot generate a token transfer transaction without the use of
					proprietary software.
				`),
				evaluateMpc({
					controllingSharesInSelfCustodyByDefault: 'YES',
					initialKeyGeneration: 'ON_USER_DEVICE',
					tokenTransferTransactionGeneration:
						TransactionGenerationCapability.USING_PROPRIETARY_STANDALONE_APP,
				}).value,
			),
			exampleRating(
				mdParagraph(`
					The wallet is an ${eipMarkdownLink(erc4337)} (smart contract) wallet
					over which the user does not have full self-custodial control by
					default, but can create a transaction that modifies this using
					standalone open-source software.
				`),
				evaluateMultifactor(
					{
						controllingSharesInSelfCustodyByDefault: 'NO',
						keyRotationTransactionGeneration:
							TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
						tokenTransferTransactionGeneration:
							TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
					},
					'erc4337',
				).value,
			),
		],
		pass: [
			exampleRating(
				mdParagraph(`
					The wallet is an EOA wallet that derives keys from a seed phrase using
					[BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki),
					[BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
					and [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki),
					and allows the user to export the seed phrase and/or private keys.
				`),
				evaluateEoa({
					canExportPrivateKey: true,
					keyDerivation: {
						canExportSeedPhrase: true,
						type: 'BIP32',
						derivationPath: 'BIP44',
						seedPhrase: 'BIP39',
					},
				}).value,
			),
			exampleRating(
				paragraph(`
					The wallet is an MPC wallet where the user is in self-custody of
					sufficient key shares to unilaterally control the account, and can
					generate a token transfer transaction using standalone open-source
					software which does not rely on any third party API.
				`),
				evaluateMpc({
					controllingSharesInSelfCustodyByDefault: 'YES',
					initialKeyGeneration: 'ON_USER_DEVICE',
					tokenTransferTransactionGeneration:
						TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
				}).value,
			),
			exampleRating(
				mdParagraph(`
					The wallet is an ${eipMarkdownLink(erc4337)} (smart contract) wallet
					over which the user has full self-custodial control by default,
					and can create token transfer transactions using solely open-source
					software without relying on a third-party API.
				`),
				evaluateMultifactor(
					{
						controllingSharesInSelfCustodyByDefault: 'NO',
						keyRotationTransactionGeneration:
							TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
						tokenTransferTransactionGeneration:
							TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
					},
					'erc4337',
				).value,
			),
		],
	},
	evaluate: (features: ResolvedFeatures): Evaluation<AccountPortabilityValue> => {
		if (features.accountSupport === null) {
			return unrated(accountPortability, brand, null)
		}
		const evaluations: Array<Evaluation<AccountPortabilityValue>> = []
		let defaultEvaluation: Evaluation<AccountPortabilityValue> | null = null
		if (isAccountTypeSupported<AccountTypeEoa>(features.accountSupport.eoa)) {
			const evaluation = evaluateEoa(features.accountSupport.eoa)
			evaluations.push(evaluation)
			if (features.accountSupport.defaultAccountType === AccountType.eoa) {
				defaultEvaluation = evaluation
			}
		}
		if (isAccountTypeSupported<AccountTypeMpc>(features.accountSupport.mpc)) {
			const evaluation = evaluateMpc(features.accountSupport.mpc)
			evaluations.push(evaluation)
			if (features.accountSupport.defaultAccountType === AccountType.mpc) {
				defaultEvaluation = evaluation
			}
		}
		if (isAccountTypeSupported<AccountTypeMutableMultifactor>(features.accountSupport.rawErc4337)) {
			const evaluation = evaluateMultifactor(features.accountSupport.rawErc4337, 'erc4337')
			evaluations.push(evaluation)
			if (features.accountSupport.defaultAccountType === AccountType.rawErc4337) {
				defaultEvaluation = evaluation
			}
		}
		if (isAccountTypeSupported<AccountType7702>(features.accountSupport.eip7702)) {
			const evaluation = evaluateEip7702(features.accountSupport)
			evaluations.push(evaluation)
			if (features.accountSupport.defaultAccountType === AccountType.eip7702) {
				defaultEvaluation = evaluation
			}
		}
		if (!isNonEmptyArray(evaluations) || defaultEvaluation === null) {
			throw new Error('No account type evaluations; should be impossible from type system')
		}
		const oneRating = nonEmptyGet(evaluations).value.rating
		if (evaluations.every(evaluation => evaluation.value.rating === oneRating)) {
			return defaultEvaluation
		}
		return pickWorstRating<AccountPortabilityValue>(evaluations)
	},
	aggregate: pickWorstRating<AccountPortabilityValue>,
}
