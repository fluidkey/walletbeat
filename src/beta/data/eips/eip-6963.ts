import { type Eip, EipPrefix, EipStatus } from '@/beta/schema/eips';
import { paragraph } from '@/beta/types/text';

export const eip6963: Eip = {
  prefix: EipPrefix.EIP,
  number: '6963',
  friendlyName: null,
  formalTitle: 'Multi Injected Provider Discovery',
  status: EipStatus.FINAL,
  summary: paragraph(`
    An alternative discovery mechanism to EIP-1193 which supports discovering multiple injected Wallet Providers in a web page.
  `),
  whyItMatters: paragraph(`
    EIP-9693 defines a consistent standard for browser-extension-based
    Ethereum wallets to integrate with web applications. This allows
    web applications to interact with the wallet and Ethereum blockchain
    without needing to implement wallet-specific code.
  `),
  note: paragraph(`
    EIP-6963 has largely superseded EIP-1193, as it provides better
    support for the case where the user has installed multiple Ethereum
    wallet browser extensions.
  `),
};
