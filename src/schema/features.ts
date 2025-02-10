import type { DataCollection } from './features/privacy/data-collection';
import type { License } from './features/license';
import {
  type ResolvedFeature,
  resolveFeature,
  type Variant,
  type VariantFeature,
} from './variants';
import type { Monetization } from './features/monetization';
import type { WithRef } from './reference';
import type { EthereumL1LightClientSupport } from './features/security/light-client';
import type { ChainConfigurability } from './features/chain-configurability';
import type { WalletProfile } from './features/profile';
import type { WalletIntegration } from './features/integration';
import type { AddressResolution } from './features/address-resolution';
import type { SecurityAudit } from './features/security/security-audits';
import type { TransactionSubmission } from './features/self-sovereignty/transaction-submission';

/**
 * A set of features about a wallet, each of which may or may not depend on
 * the wallet variant.
 */
export interface WalletFeatures {
  /**
   * The profile of the wallet, determining the use-cases and audience
   * that it is meant for. This has impact on which attributes are relevant
   * to it, and which attributes it is exempt from.
   * This is *not* per-variant, because users would not expect that a single
   * wallet would fulfill different use-cases depending on which variant of
   * the wallet they install.
   */
  profile: WalletProfile;

  /** Security features. */
  security: {
    /**
     * Public security audits the wallet has gone through.
     * If never audited, this should be an empty array, as 'null' represents
     * the fact that we haven't checked whether there have been any audit.
     */
    publicSecurityAudits: null | SecurityAudit[];

    /** Light clients. */
    lightClient: {
      /** Light client used for Ethereum L1. False means no light client support. */
      ethereumL1: VariantFeature<WithRef<EthereumL1LightClientSupport> | false>;
    };
  };

  /** Privacy features. */
  privacy: {
    /** Data collection information. */
    dataCollection: VariantFeature<DataCollection>;

    /** Privacy policy URL of the wallet. */
    privacyPolicy: VariantFeature<string>;
  };

  /** Self-sovereignty features. */
  selfSovereignty: {
    /** Describes the set of options for submitting transactions. */
    transactionSubmission: VariantFeature<TransactionSubmission>;
  };

  /** Level of configurability for chains. */
  chainConfigurability: VariantFeature<ChainConfigurability>;

  /** Integration inside browsers, mobile phones, etc. */
  integration: WalletIntegration;

  /**
   * Whether the wallet supports multiple addresses.
   * A single seed phrase still counts as multiple addresses.
   */
  multiAddress: VariantFeature<boolean>;

  /** How the wallet resolves Ethereum addresses. */
  addressResolution: VariantFeature<WithRef<AddressResolution>>;

  /** License of the wallet. */
  license: VariantFeature<WithRef<License>>;

  /** The monetization model of the wallet. */
  monetization: VariantFeature<Monetization>;
}

/**
 * A set of features about a specific wallet variant.
 * All features are resolved to a single variant here.
 */
export interface ResolvedFeatures {
  /** The wallet variant which was used to resolve the feature tree. */
  variant: Variant;

  /** The profile of the wallet. */
  profile: WalletProfile;

  security: {
    publicSecurityAudits: null | SecurityAudit[];
    lightClient: {
      ethereumL1: ResolvedFeature<WithRef<EthereumL1LightClientSupport> | false>;
    };
  };
  privacy: {
    dataCollection: ResolvedFeature<DataCollection>;
    privacyPolicy: ResolvedFeature<string>;
  };
  selfSovereignty: {
    transactionSubmission: ResolvedFeature<TransactionSubmission>;
  };
  chainConfigurability: ResolvedFeature<ChainConfigurability>;
  integration: WalletIntegration;
  multiAddress: ResolvedFeature<boolean>;
  addressResolution: ResolvedFeature<WithRef<AddressResolution>>;
  license: ResolvedFeature<WithRef<License>>;
  monetization: ResolvedFeature<Monetization>;
}

/** Resolve a set of features according to the given variant. */
export function resolveFeatures(features: WalletFeatures, variant: Variant): ResolvedFeatures {
  const feat = <F>(feature: VariantFeature<F>): ResolvedFeature<F> =>
    resolveFeature<F>(feature, variant);
  return {
    variant,
    profile: features.profile,
    security: {
      publicSecurityAudits:
        features.security.publicSecurityAudits === null
          ? null
          : features.security.publicSecurityAudits.filter(
              audit =>
                audit.variantsScope === 'ALL_VARIANTS' || audit.variantsScope[variant] === true
            ),
      lightClient: {
        ethereumL1: feat(features.security.lightClient.ethereumL1),
      },
    },
    privacy: {
      dataCollection: feat(features.privacy.dataCollection),
      privacyPolicy: feat(features.privacy.privacyPolicy),
    },
    selfSovereignty: {
      transactionSubmission: feat(features.selfSovereignty.transactionSubmission),
    },
    chainConfigurability: feat(features.chainConfigurability),
    integration: features.integration,
    multiAddress: feat(features.multiAddress),
    addressResolution: feat(features.addressResolution),
    license: feat(features.license),
    monetization: feat(features.monetization),
  };
}
