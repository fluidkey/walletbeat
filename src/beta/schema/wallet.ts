import { resolveFeatures, type ResolvedFeatures, type WalletFeatures } from './features';
import { type AtLeastOneVariant, Variant } from './variants';
import {
  aggregateAttributes,
  evaluateAttributes,
  mapAttributesGetter,
  type EvaluationTree,
} from './attribute-groups';
import { type NonEmptyArray, nonEmptyRemap } from '@/beta/types/utils/non-empty';
import type { Paragraph } from '@/beta/types/text';
import type { Url } from './url';
import { Rating, type Attribute, type EvaluatedAttribute, type Value } from './attributes';

/** A contributor to walletbeat. */
export interface Contributor {
  name: string;
  url?: Url;
}

/** Basic wallet metadata. */
export interface WalletMetadata {
  /**
   * ID of the wallet.
   * It is expected that a wallet image exists at
   * `/public/images/wallet/${id}.${iconExtension}`.
   */
  id: string;

  /** Human-readable name of the wallet. */
  displayName: string;

  /** Extension of the wallet icon image at
   * `/public/images/wallet/${id}.${iconExtension}`.
   * Wallet icons should be cropped to touch all edges, then minimal margins
   * added to make the image aspect ratio be 1:1 (square).
   */
  iconExtension: 'png' | 'svg';

  /**
   * A short (two or three sentences) description about the wallet.
   * This is shown under the wallet's name in expanded view.
   */
  blurb: Paragraph;

  /**
   * If the wallet has a built-in username scheme, this should refer to
   * a human-friendly way to refer to this scheme.
   * For example, for Coinbase Wallet which offers "cb.id" usernames,
   * this should be "cb.id handle" or similar.
   */
  pseudonymType?: string;

  /** External link to the wallet's website. */
  url: Url;

  /** Link to the wallet's source code repository, if public. */
  repoUrl: Url | null;

  /** The last time the wallet information was updated. */
  lastUpdated: string;

  /** List of people who contributed to the information for this wallet. */
  contributors: NonEmptyArray<Contributor>;
}

/**
 * The interface used to describe wallets.
 */
export interface Wallet {
  /** Wallet metadata (name, URL, icon, etc.) */
  metadata: WalletMetadata;

  /** Set of variants for which the wallet has an implementation. */
  variants: Record<Variant, boolean>;

  /** All wallet features. */
  features: WalletFeatures;
}

export interface ResolvedWallet {
  /** Wallet metadata (name, URL, icon, etc.) */
  metadata: WalletMetadata;

  /** The variant for which all features were resolved to. */
  variant: Variant;

  /** All wallet features. */
  features: ResolvedFeatures;

  /** Attribute tree for the wallet variant. */
  attributes: EvaluationTree;
}

/** A fully-rated wallet ready for display. */
export interface RatedWallet {
  /** Wallet metadata. */
  metadata: WalletMetadata;

  /** Per-variant evaluation. */
  variants: AtLeastOneVariant<ResolvedWallet>;

  /** For each variant, set of attribute IDs for which the rating is unique to this variant. */
  variantSpecificEvaluations: AtLeastOneVariant<Set<string>>;

  /** Aggregate evaluation across all variants. */
  overall: EvaluationTree;
}

function resolveVariant(wallet: Wallet, variant: Variant): ResolvedWallet | null {
  if (!wallet.variants[variant]) {
    return null;
  }
  const resolvedFeatures = resolveFeatures(wallet.features, variant);
  return {
    metadata: wallet.metadata,
    variant,
    features: resolvedFeatures,
    attributes: evaluateAttributes(resolvedFeatures),
  };
}

export function rateWallet(wallet: Wallet): RatedWallet {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe because each feature must already have at least one variant populated.
  const perVariantWallets: AtLeastOneVariant<ResolvedWallet> = Object.fromEntries(
    Object.entries({
      browser: resolveVariant(wallet, Variant.BROWSER),
      mobile: resolveVariant(wallet, Variant.MOBILE),
      desktop: resolveVariant(wallet, Variant.DESKTOP),
    }).filter(([_, val]) => val !== null)
  ) as AtLeastOneVariant<ResolvedWallet>;
  const perVariantTree: AtLeastOneVariant<EvaluationTree> = nonEmptyRemap(
    perVariantWallets,
    (_: Variant, wallet: ResolvedWallet) => wallet.attributes
  );
  const hasMultipleVariants = Object.values(perVariantTree).length > 1;
  const variantSpecificEvaluations = nonEmptyRemap(
    perVariantTree,
    (variant: Variant, evalTree: EvaluationTree): Set<string> => {
      const variantSpecificSet = new Set<string>();
      if (hasMultipleVariants) {
        mapAttributesGetter(
          evalTree,
          <V extends Value>(
            getter: (tree: EvaluationTree) => EvaluatedAttribute<V> | undefined
          ) => {
            const currentVariantEval = getter(evalTree);
            if (
              currentVariantEval === undefined ||
              currentVariantEval.evaluation.value.rating === Rating.UNRATED
            ) {
              return;
            }
            const currentVariantEvalId = currentVariantEval.evaluation.value.id;
            let numSameIdFound = 0;
            nonEmptyRemap(perVariantTree, (versusVariant: Variant, versusTree: EvaluationTree) => {
              if (versusVariant === variant) {
                return;
              }
              const versusEval = getter(versusTree);
              if (versusEval === undefined) {
                return;
              }
              if (
                versusEval.evaluation.value.rating === Rating.UNRATED ||
                versusEval.evaluation.value.id === currentVariantEvalId
              ) {
                numSameIdFound++;
              }
            });
            if (numSameIdFound === 0) {
              variantSpecificSet.add(currentVariantEval.attribute.id);
            }
          }
        );
      }
      return variantSpecificSet;
    }
  );
  return {
    metadata: wallet.metadata,
    variants: perVariantWallets,
    variantSpecificEvaluations,
    overall: aggregateAttributes(perVariantTree),
  };
}

/**
 * Returns whether an attribute's evaluation is unique for the given variant
 * within this wallet.
 * For example, for a wallet that is licensed as MIT license for its desktop
 * web version, but proprietary for its mobile version, this function will
 * return true for the mobile variant only.
 *
 * @param ratedWallet The wallet from which the evaluation is taken.
 * @param variant The variant for which the attribute evaluation may be unique.
 * @param attribute The attribute for which the evaluation may be unique.
 * @returns Whether the evaluation of the given attribute is unique to the
 *          given variant within the given wallet.
 */
export function attributeEvaluationIsUniqueToVariant<V extends Value>(
  ratedWallet: RatedWallet,
  variant: Variant,
  attribute: Attribute<V>
): boolean {
  const uniqueAttributeIds = ratedWallet.variantSpecificEvaluations[variant];
  if (uniqueAttributeIds === undefined) {
    return false;
  }
  return uniqueAttributeIds.has(attribute.id);
}
