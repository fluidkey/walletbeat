import type { ResolvedFeatures } from '@/schema/features'
import {
	Rating,
	type Value,
	type Attribute,
	type Evaluation,
	exampleRating,
} from '@/schema/attributes'
import { pickWorstRating, unrated } from '../common'
import { markdown, paragraph, sentence } from '@/types/content'
import type { WalletMetadata } from '@/schema/wallet'
import {
	TransactionSubmissionL2Support,
	type TransactionSubmissionL2Type,
} from '@/schema/features/self-sovereignty/transaction-submission'
import { isNonEmptyArray } from '@/types/utils/non-empty'
import { transactionInclusionDetailsContent } from '@/types/content/transaction-inclusion-details'

const brand = 'attributes.self_sovereignty.transaction_inclusion'
export type TransactionInclusionValue = Value & {
	__brand: 'attributes.self_sovereignty.transaction_inclusion'
}

export type L1BroadcastSupport = 'NO' | 'SELF_GOSSIP' | 'OWN_NODE'

function transactionSubmissionEvaluation(
	supportsL1Broadcast: L1BroadcastSupport,
	supportAnyL2Transactions: TransactionSubmissionL2Type[],
	supportForceWithdrawal: TransactionSubmissionL2Type[],
	unsupportedL2s: TransactionSubmissionL2Type[],
): Evaluation<TransactionInclusionValue> {
	if (!isNonEmptyArray(supportAnyL2Transactions) && !isNonEmptyArray(supportForceWithdrawal)) {
		return {
			value: {
				id: 'no_l2_transaction_inclusion_support',
				rating: Rating.FAIL,
				displayName: 'No L2 force-inclusion support',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} requires trusting intermediaries in
						order to withdraw funds from L2s.
					`,
				),
				__brand: brand,
			},
			details: transactionInclusionDetailsContent({
				supportsL1Broadcast,
				supportAnyL2Transactions,
				supportForceWithdrawal,
				unsupportedL2s,
			}),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should add support for
					creating force-withdrawal transactions for L2s and broadcasting
					them on L1.
				`,
			),
		}
	}
	if (supportsL1Broadcast === 'NO') {
		return {
			value: {
				id: 'l2_transaction_inclusion_supported_but_no_l1',
				rating: Rating.PARTIAL,
				displayName: 'Intermediaries required for L1 transactions',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} relies on intermediaries when
						performing L1 transactions. This makes it possible for L1
						transactions to be censored.
					`,
				),
				__brand: brand,
			},
			details: transactionInclusionDetailsContent({
				supportsL1Broadcast,
				supportAnyL2Transactions,
				supportForceWithdrawal,
				unsupportedL2s,
			}),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should add support for broadcasting
					L1 transaction over Ethereum's gossip layer if possible, or to
					allow users to use their own self-hosted Ethereum node to broadcast
					L1 transactions.
				`,
			),
		}
	}
	const valueId = `l1${supportsL1Broadcast.toLowerCase()}_any${supportAnyL2Transactions.toSorted().join('-').toLocaleLowerCase()}_withdrawal${supportForceWithdrawal.toSorted().join('-').toLowerCase()}_no${unsupportedL2s.toSorted().join('-').toLowerCase()}`
	if (unsupportedL2s.length > 0) {
		return {
			value: {
				id: valueId,
				rating: Rating.PARTIAL,
				displayName: 'No force-withdrawal for some L2s',
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} does not implement L2
						force-withdrawal transactions for all types of L2s.
					`,
				),
				__brand: brand,
			},
			details: transactionInclusionDetailsContent({
				supportsL1Broadcast,
				supportAnyL2Transactions,
				supportForceWithdrawal,
				unsupportedL2s,
			}),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should add support for
					force-withdrawal transactions on all L2 types it supports.
				`,
			),
		}
	}
	return {
		value: {
			id: valueId,
			rating: Rating.PASS,
			displayName: 'Can force-withdraw from L2s',
			shortExplanation: sentence(
				(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} supports L2 force-withdrawal
					transactions for all L2 types.
				`,
			),
			__brand: brand,
		},
		details: transactionInclusionDetailsContent({
			supportsL1Broadcast,
			supportAnyL2Transactions,
			supportForceWithdrawal,
			unsupportedL2s,
		}),
	}
}

export const transactionInclusion: Attribute<TransactionInclusionValue> = {
	id: 'transactionInclusion',
	icon: '\u{1f4e1}', // Satellite antenna
	displayName: 'Transaction inclusion',
	wording: {
		midSentenceName: 'transaction inclusion',
	},
	question: sentence(`
		Can the wallet withdraw L2 funds to Ethereum L1 without relying on
		intermediaries?
	`),
	why: markdown(`
		One of the core tenets of Ethereum is **censorship resistance**.
		This means that users must be able to reliably get transactions
		included onchain, without the ability for intermediaries to prevent
		this from happening.

		This property is critical to ensure that all Ethereum participants are
		provided equal-opportunity, unfettered access to Ethereum, and to ensure
		that Ethereum is resilient to attackers that would want to prevent others
		from using Ethereum on such footing.

		In order to uphold this property on Ethereum L2s, users must be able to
		force transactions to be included on L2 chains as well. Most L2s
		implement such functionality by allowing L2 transactions to be
		submitted on the L1, and enforcing that their sequencing logic must
		respect such L1 force-inclusion requests by including them on the L2
		chain, typically within some fixed duration.

		By verifying that the wallet supports L2 force-withdrawal transactions,
		this attribute verifies censorship resistance at both levels: L1 and L2.
	`),
	methodology: markdown(`
		Wallets are rated based on whether users need to trust any intermediary
		in order to withdraw their funds from L2s.

		This fundamentally requires two major features:

		* A wallet must support the creation of an L1 transaction which forces the
			L2 to withdraw user funds back to the L1. This message is typically
			posted as an L1 transaction which forces the L2 sequencing process to
			take it into account.
		* Since L2 force-withdrawal transactions require an L1 transaction, the
			wallet must also be able to get this transaction included without
			relying on a third-party to broadcast this transaction for block
			inclusion. Therefore, the wallet must also support either participating
			in Ethereum's L1 gossip network, or (for environments that do not
			support this such as browser extension wallets) support broadcasting
			L1 transactions through a user's self-hosted Ethereum node.

		With these two features in place, users can withdraw their L2 funds
		without trusting intermediaries.

		Walletbeat currently only considers OP Stack chains and Arbitrum One for
		this evaluation, but more L2 chains may be added as support for
		force-withdrawal transaction becomes feasible for them.
	`),
	ratingScale: {
		display: 'pass-fail',
		exhaustive: true,
		pass: [
			exampleRating(
				paragraph(`
					The wallet supports force-withdrawal transactions on L2s, and can
					be configured to broadcast this transaction using a user's
					self-hosted L1 node.
				`),
				transactionSubmissionEvaluation('OWN_NODE', [], ['opStack'], []).value,
			),
			exampleRating(
				paragraph(`
					The wallet supports force-withdrawal transactions on L2s, and supports
					directly gossipping such transactions over the Ethereum L1 network.
				`),
				transactionSubmissionEvaluation('SELF_GOSSIP', [], ['opStack'], []).value,
			),
		],
		partial: [
			exampleRating(
				paragraph(`
					The wallet supports force-withdrawal transactions on L2s, but
					requires the use of a third-party RPC provider to submit the L1
					transaction that it would take to initiate this force-withdrawal
					transaction.
				`),
				transactionSubmissionEvaluation('NO', [], ['opStack'], []).value,
			),
			exampleRating(
				paragraph(`
					The wallet supports force-withdrawal transactions on some L2s,
					but not all of the L2s that are configured out of the box.
				`),
				transactionSubmissionEvaluation('NO', [], ['opStack'], ['arbitrum']).value,
			),
		],
		fail: exampleRating(
			paragraph(`
				The wallet does not support force-withdrawal transactions on L2s.
			`),
			transactionSubmissionEvaluation('NO', [], [], []).value,
		),
	},
	evaluate: (features: ResolvedFeatures): Evaluation<TransactionInclusionValue> => {
		if (features.selfSovereignty.transactionSubmission === null) {
			return unrated(transactionInclusion, brand, null)
		}
		if (
			features.selfSovereignty.transactionSubmission.l1.selfBroadcastViaDirectGossip === null ||
			features.selfSovereignty.transactionSubmission.l1.selfBroadcastViaSelfHostedNode === null
		) {
			return unrated(transactionInclusion, brand, null)
		}
		const supportsL1Broadcast: L1BroadcastSupport = features.selfSovereignty.transactionSubmission
			.l1.selfBroadcastViaDirectGossip
			? 'SELF_GOSSIP'
			: features.selfSovereignty.transactionSubmission.l1.selfBroadcastViaSelfHostedNode
				? 'OWN_NODE'
				: 'NO'
		const supportAnyL2Transactions: TransactionSubmissionL2Type[] = []
		const supportForceWithdrawal: TransactionSubmissionL2Type[] = []
		const unsupportedL2s: TransactionSubmissionL2Type[] = []
		for (const l2Type in features.selfSovereignty.transactionSubmission.l2) {
			if (!Object.hasOwn(features.selfSovereignty.transactionSubmission.l2, l2Type)) {
				continue
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- We are iterating over variables of this type.
			const l2 = l2Type as TransactionSubmissionL2Type
			const support = features.selfSovereignty.transactionSubmission.l2[l2]
			if (support === null) {
				return unrated(transactionInclusion, brand, null)
			}
			if (support === TransactionSubmissionL2Support.NOT_SUPPORTED_BY_WALLET_BY_DEFAULT) {
				continue
			}
			switch (support) {
				case TransactionSubmissionL2Support.SUPPORTED_WITH_FORCE_INCLUSION_OF_ARBITRARY_TRANSACTIONS:
					supportAnyL2Transactions.push(l2)
				// Fallthrough
				case TransactionSubmissionL2Support.SUPPORTED_WITH_FORCE_INCLUSION_OF_WITHDRAWALS:
					supportForceWithdrawal.push(l2)
					break
				case TransactionSubmissionL2Support.SUPPORTED_BUT_NO_FORCE_INCLUSION:
					unsupportedL2s.push(l2)
			}
		}
		return transactionSubmissionEvaluation(
			supportsL1Broadcast,
			supportAnyL2Transactions,
			supportForceWithdrawal,
			unsupportedL2s,
		)
	},
	aggregate: pickWorstRating<TransactionInclusionValue>,
}
