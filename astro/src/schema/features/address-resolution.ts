/** Which methods of address resolution a wallet supports. */
export interface AddressResolution<ARS = AddressResolutionSupport | null> {
  /**
   * Support for basic ENS lookups (ENS domain to non-chain-specific raw hex
   * address).
   */
  nonChainSpecificEnsResolution: ARS;

  /** Chain-specific address lookups. */
  chainSpecificAddressing: {
    /** Address lookup through ERC-7828. Example: `vitalik@optimism.eth` */
    erc7828: ARS;

    /** Address lookup through ERC-7831. Example: `vitalik.eth:optimism:1` */
    erc7831: ARS;
  };
}

/** How a wallet resolves addresses. */
export type AddressResolutionSupport =
  | {
      /** The wallet does not support resolving such addresses. */
      support: 'NOT_SUPPORTED';
    }
  | {
      /** The wallet supports resolving such addresses. */
      support: 'SUPPORTED';

      /**
       * The wallet reuses its own chain client provider to look up the
       * necessary data, inheriting its privacy and verifiability properties.
       */
      medium: 'CHAIN_CLIENT';
    }
  | {
      /** The wallet supports resolving such addresses. */
      support: 'SUPPORTED';

      /**
       * The wallet uses a third-party offchain provider to look up the necessary
       * data.
       */
      medium: 'OFFCHAIN';

      /**
       * Whether the third-party onchain provider's data is verified,
       * for example through a light client.
       */
      offchainDataVerifiability: 'VERIFIABLE' | 'NOT_VERIFIABLE';

      /**
       * Whether the wallet directly connects to the third-party offchain
       * provider (thereby revealing information about who is doing the
       * lookup), or using anonymizing proxies to do so.
       */
      offchainProviderConnection: 'DIRECT_CONNECTION' | 'UNIQUE_PROXY_CIRCUIT';
    };
