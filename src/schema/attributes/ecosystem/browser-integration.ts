import type { ResolvedFeatures } from '@/schema/features'
import {
	Rating,
	type Value,
	type Attribute,
	type Evaluation,
	exampleRating,
} from '@/schema/attributes'
import { exempt, pickWorstRating, unrated } from '../common'
import { markdown, paragraph, sentence } from '@/types/content'
import type { WalletMetadata } from '@/schema/wallet'
import { Variant } from '../../variants'
import { eipMarkdownLink, eipMarkdownLinkAndTitle } from '../../eips'
import { eip1193 } from '@/data/eips/eip-1193'
import { eip6963 } from '@/data/eips/eip-6963'
import { eip2700 } from '@/data/eips/eip-2700'
import type { BrowserIntegrationEip } from '../../features/integration'
import { getEip } from '@/data/eips'
import { commaListFormat } from '@/types/utils/text'
import {
	featureSupported,
	isSupported,
	notSupported,
	type Support,
} from '@/schema/features/support'

type ResolvedSupport = Record<BrowserIntegrationEip, Support>

const brand = 'attributes.ecosystem.browser_integration'
export type BrowserIntegrationValue = Value & {
	support?: ResolvedSupport
	__brand: 'attributes.ecosystem.browser_integration'
}

function browserIntegrationSupport(support: ResolvedSupport): Evaluation<BrowserIntegrationValue> {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Keys are already of type BrowserIntegrationEip, and remain so after being mapped.
	const supported: BrowserIntegrationEip[] = Object.entries<Support>(support)
		.filter(([_, v]) => isSupported(v))
		.map(([k, _]) => k) as BrowserIntegrationEip[]

	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Keys are already of type BrowserIntegrationEip, and remain so after being mapped.
	const unsupported: BrowserIntegrationEip[] = Object.entries<Support>(support)
		.filter(([_, v]) => !isSupported(v))
		.map(([k, _]) => k) as BrowserIntegrationEip[]

	if (supported.length === 0) {
		return {
			value: {
				id: 'no_support',
				rating: Rating.FAIL,
				displayName: 'No browser integration',
				support,
				shortExplanation: sentence(
					(walletMetadata: WalletMetadata) => `
						${walletMetadata.displayName} does not integrate with the browser in a standard way.
					`,
				),
				__brand: brand,
			},
			details: paragraph(
				({ wallet }) => `
					${wallet.metadata.displayName} does not adhere to any of the Ethereum standards for
					integration in web browsers.
				`,
			),
			howToImprove: markdown(
				({ wallet }) => `
					${wallet.metadata.displayName} should integrate with the browser
					using an Ethereum standard, such as ${eipMarkdownLink(eip1193)}
					or the newer ${eipMarkdownLink(eip6963)}.
				`,
			),
		}
	}
	const rating = unsupported.length === 0 ? Rating.PASS : Rating.PARTIAL
	return {
		value: {
			id: `support_${supported.join('_')}`,
			rating,
			displayName:
				unsupported.length === 0
					? 'Fully-compliant browser integration'
					: 'Partially-compliant browser integration',
			support,
			shortExplanation: sentence(
				(walletMetadata: WalletMetadata) => `
					${walletMetadata.displayName} supports
					${unsupported.length === 0 ? 'all' : 'a subset of'} the prominent standards for
					web browser integration.
				`,
			),
			__brand: brand,
		},
		details: markdown(
			({ wallet }) => `
				${wallet.metadata.displayName} supports
				${unsupported.length === 0 ? 'all' : 'a subset of'} the prominent standards for
				web browser integration:

				${isSupported(support['1193']) ? `* ${eipMarkdownLinkAndTitle(eip1193)}` : ''}
				${isSupported(support['2700']) ? `* ${eipMarkdownLinkAndTitle(eip2700)}` : ''}
				${isSupported(support['6963']) ? `* ${eipMarkdownLinkAndTitle(eip6963)}` : ''}
			`,
		),
		howToImprove:
			unsupported.length === 0
				? undefined
				: markdown(
						({ wallet }) => `
							${wallet.metadata.displayName} should implement
							${commaListFormat(unsupported.map(eipNum => eipMarkdownLink(getEip(eipNum))))}.
						`,
					),
	}
}

export const browserIntegration: Attribute<BrowserIntegrationValue> = {
	id: 'browserIntegration',
	icon: '\u{1f310}', // Globe with Meridians
	displayName: 'Browser integration',
	wording: {
		midSentenceName: 'browser integration',
	},
	question: sentence(`
		Does the wallet comply with web browser integration standards?
	`),
	why: markdown(`
		Web applications that want to integrate with Ethereum should not have to
		write code specific to the wallet that the user has installed. For this
		reason, the Ethereum community has defined web browser integration
		standards, which dictate how wallets and web pages can interact with each
		other.

		By ensuring that wallets implement this standard interface, applications
		automatically support all wallets that implement the interface. This
		ensures compatibility across wallets, and ensures that the Ethereum wallet
		ecosystem remains competitive thanks to wallet interoperability.
	`),
	methodology: markdown(`
		Wallets are rated based on whether they implement the following Ethereum
		standards for web browser integration:

		* ${eipMarkdownLinkAndTitle(eip1193)}
		* ${eipMarkdownLinkAndTitle(eip2700)}
		* ${eipMarkdownLinkAndTitle(eip6963)}

		For multi-platform wallets, only the web browser version is assessed.
	`),
	ratingScale: {
		display: 'pass-fail',
		exhaustive: true,
		pass: exampleRating(
			sentence(`
				The wallet implements all listed web browser integration standards.
			`),
			browserIntegrationSupport({
				'1193': featureSupported,
				'2700': featureSupported,
				'6963': featureSupported,
			}).value,
		),
		partial: exampleRating(
			sentence(`
				The wallet implements some but not all listed web browser integration standards.
			`),
			browserIntegrationSupport({
				'1193': featureSupported,
				'2700': featureSupported,
				'6963': notSupported,
			}).value,
		),
		fail: exampleRating(
			sentence(`
				The wallet implements none of the listed web browser integration standards.
			`),
			browserIntegrationSupport({
				'1193': notSupported,
				'2700': notSupported,
				'6963': notSupported,
			}).value,
		),
	},
	evaluate: (features: ResolvedFeatures): Evaluation<BrowserIntegrationValue> => {
		if (features.variant !== Variant.BROWSER) {
			return exempt(
				browserIntegration,
				sentence('Only browser-based wallets are rated on their browser integration support.'),
				brand,
				{},
			)
		}
		if (features.integration.browser === 'NOT_A_BROWSER_WALLET') {
			throw new Error(
				'Attempted to rate a browser-wallet with features.integration.browser set to NOT_A_BROWSER_WALLET',
			)
		}
		if (Object.values(features.integration.browser).includes(null)) {
			return unrated(browserIntegration, brand, {})
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- We just verified that none of the values are null.
		const browserIntegrationEips = features.integration.browser as ResolvedSupport
		return browserIntegrationSupport(browserIntegrationEips)
	},
	aggregate: pickWorstRating<BrowserIntegrationValue>,
}
