import type { ResolvedFeatures } from '@/beta/schema/features';
import { Rating, type Value, type Attribute, type Evaluation } from '@/beta/schema/attributes';
import { pickWorstRating, unrated } from '../common';
import {
  monetizationStrategies,
  MonetizationStrategy,
  monetizationStrategyIsUserAligned,
  monetizationStrategyName,
} from '@/beta/schema/features/monetization';
import { sentence } from '@/beta/types/text';
import type { WalletMetadata } from '@/beta/schema/wallet';

const brand = 'attributes.transparency.funding';
export type FundingValue = Value & {
  __brand: 'attributes.transparency.funding';
};

/** Funding is transparent and at least partially non-extractive. */
function transparent(id: string, sourceName: string): FundingValue {
  return {
    id: `transparent_${id.toLocaleLowerCase()}`,
    rating: Rating.YES,
    displayName: `Transparent funding (${sourceName})`,
    walletExplanation: sentence(
      (walletMetadata: WalletMetadata) => `${walletMetadata.displayName} is transparently funded.`
    ),
    __brand: brand,
  };
}

/** Funding is entirely extractive. */
function extractive(id: string, sourceName: string): FundingValue {
  return {
    id: `extractive_${id.toLocaleLowerCase()}`,
    rating: Rating.PARTIAL,
    icon: '\u{1f911}', // Money mouth face
    displayName: `User-extractive funding${sourceName !== '' ? ` (${sourceName})` : ''}`,
    walletExplanation: sentence(
      (walletMetadata: WalletMetadata) =>
        `${walletMetadata.displayName} is funded through user-extractive means${sourceName !== '' ? ` (${sourceName})` : ''}.`
    ),
    __brand: brand,
  };
}

/** Funding is not transparent. */
const unclear: FundingValue = {
  id: 'unclear',
  rating: Rating.NO,
  displayName: 'Unclear funding source',
  walletExplanation: sentence(
    (walletMetadata: WalletMetadata) => `How ${walletMetadata.displayName} is funded is unclear.`
  ),
  __brand: brand,
};

/**
 * Funding encodes the transparency and user-alignment of the monetization
 * strategies employed by the wallet.
 *
 * The "user alignment" of a monetization strategy refers to whether the
 * funding that goes to the wallet development team grows as a function
 * of the user's own goals, rather than being uncorrelated or
 * anti-correlated.
 *
 * If a wallet's monetization strategy is unclear to the public, then it
 * is not transparent.
 *
 * If a wallet has one or more monetization strategies and all of them are
 * user-aligned, then the wallet is deemed transparent.
 *
 * If a wallet has one or more monetization strategies, but all or some of
 * them are not user-aligned, and does not publish a breakdown of its
 * revenue, then the wallet is deemed "extractive".
 * This is better than "unclear", because at least the funding sources are
 * known. In order to get out of this state and be deemed "transparent", a
 * wallet needs to publish the revenue breakdown that it earns from each of
 * its monetization strategies.
 */
export const funding: Attribute<FundingValue> = {
  id: 'funding',
  icon: '\u{1fa99}', // Coin
  displayName: 'Funding',
  explanationValues: [
    unclear,
    extractive(
      MonetizationStrategy.GOVERNANCE_TOKEN_LOW_FLOAT,
      monetizationStrategyName(MonetizationStrategy.GOVERNANCE_TOKEN_LOW_FLOAT)
    ),
    transparent(
      MonetizationStrategy.TRANSPARENT_CONVENIENCE_FEES,
      monetizationStrategyName(MonetizationStrategy.TRANSPARENT_CONVENIENCE_FEES)
    ),
  ],
  evaluate: (features: ResolvedFeatures): Evaluation<FundingValue> => {
    if (features.monetization === null) {
      return { value: unrated(funding, brand) };
    }
    const strategies: MonetizationStrategy[] = [];
    for (const { strategy, value } of monetizationStrategies(features.monetization)) {
      switch (value) {
        case null:
          return { value: unrated(funding, brand) };
        case true:
          strategies.push(strategy);
          break;
        case false:
          break; // Do nothing.
      }
    }
    const numStrategies = strategies.length;
    if (numStrategies === 0) {
      return { value: unclear };
    }
    const extractiveStrategies = [];
    const userAlignedStrategies = [];
    for (const strategy of strategies) {
      if (monetizationStrategyIsUserAligned(strategy)) {
        userAlignedStrategies.push(strategy);
      } else {
        extractiveStrategies.push(strategy);
      }
    }
    if (!features.monetization.revenueBreakdownIsPublic && extractiveStrategies.length > 0) {
      if (extractiveStrategies.length === 1) {
        return {
          value: extractive(
            extractiveStrategies[0],
            monetizationStrategyName(extractiveStrategies[0])
          ),
        };
      }
      return { value: extractive('multi', '') };
    }
    if (numStrategies === 1) {
      return {
        value: transparent(strategies[0], monetizationStrategyName(strategies[0])),
      };
    }
    return { value: transparent('multi', 'Multiple sources') };
  },
  aggregate: pickWorstRating<FundingValue>,
};
