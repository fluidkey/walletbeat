/**
 * Customization options that exist for chains.
 */
export interface ChainConfigurability {
  /** Can set a custom RPC endpoint address for L1. */
  overrideL1RpcEndpoint: boolean;

  /**
   * Can override the RPC endpoint for built-in chains other than L1.
   */
  overrideOtherRpcEndpoints: boolean;

  /** Can add custom chains. */
  customChains: boolean;
}
