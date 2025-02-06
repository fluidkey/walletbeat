import type { WithRef } from '../reference';

/**
 * EIPs related to web browser integration standards.
 */
export type BrowserIntegrationEip = '1193' | '2700' | '6963';

/**
 * Level of integration of a wallet within browsers, mobile phones, etc.
 */
export interface WalletIntegration {
  /**
   * Browser-level integrations.
   * Should be set to 'NOT_A_BROWSER_WALLET' if the wallet has no browser
   * version.
   *
   * Protip to test support:
   *   - EIP-1193: Type `window.ethereum` in the console.
   *   - EIP-2700: Type `window.ethereum.on` and `window.ethereum.removeListener` in the console.
   *   - EIP-6963: Check https://eip6963.org/
   */
  browser: 'NOT_A_BROWSER_WALLET' | WithRef<Record<BrowserIntegrationEip, boolean | null>>;
}
