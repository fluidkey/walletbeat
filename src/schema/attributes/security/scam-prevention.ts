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
import { isNonEmptyArray, type NonEmptyArray } from '@/types/utils/non-empty'
import type { WithRef } from '../../reference'
import { isSupported, notSupported, supported } from '@/schema/features/support'
import { WalletProfile } from '@/schema/features/profile'
import type { ScamAlerts } from '@/schema/features/security/scam-alerts'
import { commaListFormat } from '@/types/utils/text'
import { scamAlertsDetailsContent } from '@/types/content/scam-alert-details'

export type ScamAlertSupport = WithRef<{
	feature: string
	supported: boolean
	required: boolean
	privacyPreserving: boolean
	humanFeature: string
	listFeature: string
}>

const brand = 'attributes.security.scam_alert'
export type ScamPreventionValue = Value &
	(
		| {
				scamAlerts: ScamAlerts
				scamUrlWarning: ScamAlertSupport & {
					feature: 'scamUrlWarning'
				}
				sendTransactionWarning: ScamAlertSupport & {
					feature: 'sendTransactionWarning'
				}
				contractTransactionWarning: ScamAlertSupport & {
					feature: 'contractTransactionWarning'
				}
		  }
		| { scamAlerts: null }
	) & {
		__brand: 'attributes.security.scam_alert'
	}

function rateSendTransactionWarning(scamAlerts: ScamAlerts): ScamAlertSupport & {
	feature: 'sendTransactionWarning'
} {
	const baseProps = {
		feature: 'sendTransactionWarning',
		humanFeature: 'outgoing transactions to unknown addresses',
		listFeature: 'Warning you when sending funds to unknown addresses',
		required: false,
	} as const
	if (!isSupported(scamAlerts.sendTransactionWarning)) {
		return {
			supported: false,
			privacyPreserving: false,
			...baseProps,
		}
	}
	const supported =
		scamAlerts.sendTransactionWarning.newRecipientWarning ||
		scamAlerts.sendTransactionWarning.userWhitelist
	if (!supported) {
		throw new Error(
			'sendTransactionWarning: If supported, at least one implementation mechanism must be enabled',
		)
	}
	return {
		supported,
		privacyPreserving:
			!scamAlerts.sendTransactionWarning.leaksRecipient &&
			[
				scamAlerts.sendTransactionWarning.leaksUserAddress,
				scamAlerts.sendTransactionWarning.leaksUserIp,
			].filter(x => x).length <= 1,
		ref: scamAlerts.sendTransactionWarning.ref,
		...baseProps,
	}
}

function rateContractTransactionWarning(scamAlerts: ScamAlerts): ScamAlertSupport & {
	feature: 'contractTransactionWarning'
} {
	const baseProps = {
		feature: 'contractTransactionWarning',
		humanFeature: 'transactions with potential scam contracts',
		listFeature: 'Warning you when interacting with potential scam contracts',
		required: false,
	} as const
	if (!isSupported(scamAlerts.contractTransactionWarning)) {
		return {
			supported: false,
			privacyPreserving: false,
			...baseProps,
		}
	}
	const supported =
		scamAlerts.contractTransactionWarning.contractRegistry ||
		scamAlerts.contractTransactionWarning.previousContractInteractionWarning ||
		scamAlerts.contractTransactionWarning.recentContractWarning
	if (!supported) {
		throw new Error(
			'contractTransactionWarning: If supported, at least one implementation mechanism must be enabled',
		)
	}
	return {
		supported,
		privacyPreserving:
			[
				scamAlerts.contractTransactionWarning.leaksUserIp,
				scamAlerts.contractTransactionWarning.leaksUserAddress,
				scamAlerts.contractTransactionWarning.leaksContractAddress,
			].filter(x => x).length <= 1,
		ref: scamAlerts.contractTransactionWarning.ref,
		...baseProps,
	}
}

function rateScamUrlWarning(scamAlerts: ScamAlerts): ScamAlertSupport & {
	feature: 'scamUrlWarning'
} {
	const baseProps = {
		feature: 'scamUrlWarning',
		humanFeature: 'connections to potential scam applications',
		listFeature: 'Warning you when connecting to potential scam applications',
		required: false,
	} as const
	const scamUrlWarning = scamAlerts.scamUrlWarning
	if (!isSupported(scamUrlWarning)) {
		return {
			supported: false,
			privacyPreserving: false,
			...baseProps,
		}
	}
	return {
		supported: true,
		privacyPreserving: ((): boolean => {
			switch (scamUrlWarning.leaksVisitedUrl) {
				case 'NO':
					return true
				case 'PARTIAL_HASH_OF_DOMAIN':
					return true
				case 'FULL_URL':
					return false
				case 'DOMAIN_ONLY':
					return !scamUrlWarning.leaksIp && !scamUrlWarning.leaksUserAddress
			}
		})(),
		ref: scamUrlWarning.ref,
		...baseProps,
	}
}

function evaluateScamAlerts(
	walletProfile: WalletProfile,
	scamAlerts: ScamAlerts,
): Evaluation<ScamPreventionValue> {
	const sendTransactionWarning = rateSendTransactionWarning(scamAlerts)
	const contractTransactionWarning = rateContractTransactionWarning(scamAlerts)
	const scamUrlWarning = rateScamUrlWarning(scamAlerts)
	const requiredFeatures = ((): NonEmptyArray<ScamAlertSupport> => {
		switch (walletProfile) {
			case WalletProfile.PAYMENTS:
				return [sendTransactionWarning]
			case WalletProfile.GENERIC:
				return [sendTransactionWarning, contractTransactionWarning, scamUrlWarning]
		}
	})()
	for (const feature of requiredFeatures) {
		feature.required = true
	}
	const supportedFeatures = requiredFeatures.filter(sas => sas.supported)
	const unsupportedFeatures = requiredFeatures.filter(sas => !sas.supported)
	if (!isNonEmptyArray(supportedFeatures)) {
		// No features supported.
		return {
			value: {
				id: 'none_implemented',
				displayName: 'No scam prevention',
				rating: Rating.FAIL,
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} makes no attempt to warn the user
						about potential scams.
					`,
				),
				scamAlerts,
				sendTransactionWarning,
				contractTransactionWarning,
				scamUrlWarning,
				__brand: brand,
			},
			details: scamAlertsDetailsContent({}),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should implement scam alerting features.
				`,
			),
		}
	}
	const privacyPreservingFeatures = supportedFeatures.filter(sas => sas.privacyPreserving)
	if (
		requiredFeatures.includes(scamUrlWarning) &&
		isSupported(scamAlerts.scamUrlWarning) &&
		!scamUrlWarning.privacyPreserving
	) {
		// Special case: If URLs are leaked, this gets a FAIL.
		if (scamAlerts.scamUrlWarning.leaksVisitedUrl === 'FULL_URL') {
			return {
				value: {
					id: 'leak_full_url',
					displayName: 'Scam prevention feature leaks history',
					rating: Rating.FAIL,
					shortExplanation: sentence(
						(walletMetadata: WalletMetadata) => `
							${walletMetadata.displayName} warns you about potential scams,
							but leaks your browsing history in the process.
						`,
					),
					scamAlerts,
					sendTransactionWarning,
					contractTransactionWarning,
					scamUrlWarning,
					__brand: brand,
				},
				details: scamAlertsDetailsContent({}),
				howToImprove: mdParagraph(
					({ wallet }) => `
						No application should ever send your browsing history to a
						third-party, and neither should ${wallet.metadata.displayName}.

						Scam URL detection can be implemented in a privacy-preserving
						manner using a local database or downloading a list of known-bad
						domains with the
						[same domain name hash prefix](https://security.googleblog.com/2022/08/how-hash-based-safe-browsing-works-in.html).
					`,
				),
			}
		}
		if (
			scamAlerts.scamUrlWarning.leaksVisitedUrl === 'DOMAIN_ONLY' &&
			(scamAlerts.scamUrlWarning.leaksUserAddress || scamAlerts.scamUrlWarning.leaksIp)
		) {
			return {
				value: {
					id: 'leak_domain',
					displayName: 'Scam prevention feature leaks website history',
					rating: Rating.FAIL,
					shortExplanation: sentence(
						(walletMetadata: WalletMetadata) => `
							${walletMetadata.displayName} warns you about potential scams,
							but leaks your browsed websites in the process.
						`,
					),
					scamAlerts,
					sendTransactionWarning,
					contractTransactionWarning,
					scamUrlWarning,
					__brand: brand,
				},
				details: scamAlertsDetailsContent({}),
				howToImprove: mdParagraph(
					({ wallet }) => `
						No application should ever send your browsing history to a
						third-party, and neither should ${wallet.metadata.displayName}.

						Scam URL detection can be implemented in a privacy-preserving
						manner using a local database or downloading a list of known-bad
						domains with the
						[same domain name hash prefix](https://security.googleblog.com/2022/08/how-hash-based-safe-browsing-works-in.html).
					`,
				),
			}
		}
	}
	if (unsupportedFeatures.length > 0) {
		// Some but not all features supported.
		return {
			value: {
				id: 'partially_supported',
				displayName: 'Some scam prevention features',
				rating: Rating.PARTIAL,
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} warns the user about
						${commaListFormat(supportedFeatures.map(sas => sas.humanFeature))}
						but not about ${commaListFormat(unsupportedFeatures.map(sas => sas.humanFeature))}
					`,
				),
				scamAlerts,
				sendTransactionWarning,
				contractTransactionWarning,
				scamUrlWarning,
				__brand: brand,
			},
			details: scamAlertsDetailsContent({}),
			howToImprove: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should implement the following features:

					${unsupportedFeatures
						.map(
							sas => `
							*	${sas.listFeature}
						`,
						)
						.join('\n')}
				`,
			),
		}
	}
	if (privacyPreservingFeatures.length < supportedFeatures.length) {
		const needsImprovement = (sas: ScamAlertSupport): boolean =>
			sas.required && sas.supported && !sas.privacyPreserving
		// Not all features implemented with privacy support.
		return {
			value: {
				id: 'need_privacy',
				displayName: 'Privacy-invasive scam prevention',
				rating: Rating.PARTIAL,
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} warns the user about
						${commaListFormat(supportedFeatures.map(sas => sas.humanFeature))}
						in a privacy-invasive way.
					`,
				),
				scamAlerts,
				sendTransactionWarning,
				contractTransactionWarning,
				scamUrlWarning,
				__brand: brand,
			},
			details: scamAlertsDetailsContent({}),
			howToImprove: mdParagraph(
				({ wallet }) => `
					${wallet.metadata.displayName} should ensure all scam alerting
					features are implemented in a privacy-preserving manner.

					${
						needsImprovement(sendTransactionWarning)
							? ''
							: `
					* Sending a transaction should not allow a third-party to learn
						a link between any of the sender's IP or Ethereum address
						and the recipient's address.
					`
					}
					${
						needsImprovement(contractTransactionWarning)
							? ''
							: `
					* Checking arbitrary transactions for potential scams should
						not allow a third-party to link your IP or Ethereum address
						to the contract you are about to interact with or your upcoming
						transaction.
					`
					}
					${
						needsImprovement(scamUrlWarning)
							? ''
							: `
					* Checking arbitrary transactions for potential scams should
						not allow a third-party to link your browsing history with your
						IP or Ethereum address.
					`
					}
				`,
			),
		}
	}
	// All features implements with privacy.
	return {
		value: {
			id: 'all_implemented',
			displayName: 'Full-featured scam prevention',
			rating: Rating.PASS,
			shortExplanation: sentence(
				(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} warns the user about
					${commaListFormat(supportedFeatures.map(sas => sas.humanFeature))}.
				`,
			),
			scamAlerts,
			sendTransactionWarning,
			contractTransactionWarning,
			scamUrlWarning,
			__brand: brand,
		},
		details: scamAlertsDetailsContent({}),
	}
}

export const scamPrevention: Attribute<ScamPreventionValue> = {
	id: 'scamPrevention',
	icon: '\u{1f6a8}', // Police Cars Revolving Light
	displayName: 'Scam prevention',
	wording: {
		midSentenceName: 'scam prevention',
	},
	question: sentence(`
		Does the wallet warn the user about potential scams?
	`),
	why: markdown(`
		Transactions in Ethereum are very difficult to reverse, and there is no
		shortage of scams. Wallets have a role to play in helping users avoid
		known scams ahead of the user making the transaction.
	`),
	methodology: markdown(`
		Wallets are rated based on whether they alert the user about potential
		scams. This is measured along three scenarios:
		**Does the wallet *warn* the user when...**

		* Sending funds to an address the user has never previously sent or
			received funds from before
		* Interacting with a contract that is known to be a scam
		* Interacting with a contract that the user has never previously
			interacted with before
		* Interacting with a contract that has only recently been deployed
			onchain
		* Connecting to an app that is known to be a scam

		For payments-focused wallets that do not support interacting with
		arbitrary contracts or external applications, only the payment scenario
		applies.

		Note that wallets should only *warn* the user about such scenarios, not
		outright *prevent* the user from making such transactions, as preventing
		them entirely would limit the user's ability to have real sovereignty
		over their own wallet.

		Wallets are also rated based on whether these warnings are implemented
		in a privacy-preserving manner. Specifically:

		* When sending funds, does the lookup for past interactions with that
		  address unconditionally reveal the sender and recipient addresses to a
			third-party other than the wallet's default RPC provider for this chain?

			* Wallets can implement this feature in a privacy-preserving manner by
				maintaining a local set of known addresses.

		* When interacting with a contract, does the check whether that contract
			is known to be a scam reveal the user's IP address together with the
			contract address about to be interacted with?

			* This is a privacy leak similar to that of leaking the user's
				browsing history, as contract addresses are usually closely tied to
				the application being visited.
			* Wallets can implement this feature in a privacy-preserving manner by
				maintaining a local, frequently-updated cache of known-scam contract
				addresses.

		* When connecting to an application, does the check whether that
			application reveal the domain name or URL of the application being used?

			* If leaking full URLs, this is a privacy leak similar to that of
				leaking the user's browsing history.
			* If leaking domain names only, they must not be linkable to the
				user's IP address or Ethereum address.
			* Wallets can implement this feature in a privacy-preserving manner by
				maintaining a local, frequently-updated cache of known-scam contract
				URLs, or by looking up such a list based on a domain hash prefix
				like [Safe Browsing](https://security.googleblog.com/2022/08/how-hash-based-safe-browsing-works-in.html).
	`),
	ratingScale: {
		display: 'fail-pass',
		exhaustive: false,
		fail: [
			exampleRating(
				sentence(`
					The wallet does not implement any form of scam alerting.
				`),
				evaluateScamAlerts(WalletProfile.GENERIC, {
					contractTransactionWarning: notSupported,
					scamUrlWarning: notSupported,
					sendTransactionWarning: notSupported,
				}).value,
			),
			exampleRating(
				sentence(`
					The wallet leaks visited URLs to a third-party as part of its
					malicious app warning feature.
				`),
				evaluateScamAlerts(WalletProfile.GENERIC, {
					contractTransactionWarning: notSupported,
					scamUrlWarning: supported({
						leaksVisitedUrl: 'FULL_URL',
						leaksUserAddress: false,
						leaksIp: false,
					}),
					sendTransactionWarning: notSupported,
				}).value,
			),
		],
		partial: [
			exampleRating(
				sentence(`
					The wallet implements some but not all of the required scam warning
					features.
				`),
				evaluateScamAlerts(WalletProfile.GENERIC, {
					contractTransactionWarning: notSupported,
					scamUrlWarning: supported({
						leaksVisitedUrl: 'NO',
						leaksUserAddress: false,
						leaksIp: true,
					}),
					sendTransactionWarning: supported({
						newRecipientWarning: true,
						userWhitelist: false,
						leaksRecipient: false,
						leaksUserAddress: false,
						leaksUserIp: false,
					}),
				}).value,
			),
			exampleRating(
				sentence(`
					The wallet implements all required scam warning features, but not in
					a privacy-preserving manner.
				`),
				evaluateScamAlerts(WalletProfile.GENERIC, {
					contractTransactionWarning: supported({
						contractRegistry: true,
						previousContractInteractionWarning: true,
						recentContractWarning: false,
						leaksContractAddress: false,
						leaksUserAddress: false,
						leaksUserIp: true,
					}),
					scamUrlWarning: supported({
						leaksVisitedUrl: 'NO',
						leaksUserAddress: true,
						leaksIp: true,
					}),
					sendTransactionWarning: supported({
						newRecipientWarning: true,
						userWhitelist: false,
						leaksRecipient: false,
						leaksUserAddress: false,
						leaksUserIp: false,
					}),
				}).value,
			),
		],
		pass: exampleRating(
			sentence(`
				The wallet implements all required scam warning features in a
				privacy-preserving manner.
			`),
			evaluateScamAlerts(WalletProfile.GENERIC, {
				contractTransactionWarning: supported({
					contractRegistry: true,
					previousContractInteractionWarning: true,
					recentContractWarning: false,
					leaksContractAddress: true,
					leaksUserAddress: false,
					leaksUserIp: false,
				}),
				scamUrlWarning: supported({
					leaksVisitedUrl: 'PARTIAL_HASH_OF_DOMAIN',
					leaksUserAddress: false,
					leaksIp: true,
				}),
				sendTransactionWarning: supported({
					newRecipientWarning: true,
					userWhitelist: false,
					leaksRecipient: true,
					leaksUserAddress: false,
					leaksUserIp: false,
				}),
			}).value,
		),
	},
	evaluate: (features: ResolvedFeatures): Evaluation<ScamPreventionValue> => {
		if (features.security.scamAlerts === null) {
			return unrated(scamPrevention, brand, { scamAlerts: null })
		}
		return evaluateScamAlerts(features.profile, features.security.scamAlerts)
	},
	aggregate: pickWorstRating<ScamPreventionValue>,
}
