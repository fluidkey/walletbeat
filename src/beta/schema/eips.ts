import type { Paragraph } from '../types/text';

/**
 * The set of all EIP numbers tracked by Walletbeat.
 */
export type EipNumber = '1193' | '2700' | '6963' | '7828' | '7831';

/**
 * The status of an Ethereum Improvement Proposal (EIP).
 */
export enum EipStatus {
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
}

/**
 * The prefix of an Ethereum Improvement Proposal (EIP).
 */
export enum EipPrefix {
  EIP = 'EIP',
  ERC = 'ERC',
}

/**
 * Data about a single Ethereum Improvement Proposal (EIP).
 */
export interface Eip {
  /** EIP prefix (EIP or ERC) */
  prefix: EipPrefix;

  /** Number of the EIP, as a string. */
  number: EipNumber;

  /** Walletbeat-specific friendly name. */
  friendlyName: string | null;

  /** Formal title as from the EIP repository. */
  formalTitle: string;

  /** EIP status as from the EIP repository. */
  status: EipStatus;

  /** EIP summary, as from the EIP repository with some minor tweaks if needed. */
  summary: Paragraph;

  /** Walletbeat-specific explanation of why this EIP matters. */
  whyItMatters: Paragraph;

  /** Walletbeat-specific notes (e.g. precedent/alternative EIPs). */
  note?: Paragraph;
}

/** Return a short label for an EIP (example: "ERC-20"). */
export function eipShortLabel(eip: Eip): string {
  return `${eip.prefix}-${eip.number}`;
}

/** Return a label for an EIP (example: "ERC-20 (fungible tokens)"). */
export function eipLabel(eip: Eip): string {
  const shortLabel = eipShortLabel(eip);
  return eip.friendlyName === null ? shortLabel : `${shortLabel} (${eip.friendlyName})`;
}

/** Return the eips.ethereum.org URL for an EIP. */
export function eipEthereumDotOrgUrl(eip: EipNumber | Eip): string {
  return `https://eips.ethereum.org/EIPS/eip-${typeof eip === 'string' ? eip : eip.number}`;
}

/**  Return a markdown link for an EIP. */
export function eipMarkdownLink(eip: Eip): string {
  return `[${eipLabel(eip)}](${eipEthereumDotOrgUrl(eip)})`;
}

/** Return a markdown link and a title for an EIP. */
export function eipMarkdownLinkAndTitle(eip: Eip): string {
  return `[${eipShortLabel(eip)}](${eipEthereumDotOrgUrl(eip)}): ${eip.friendlyName ?? `"${eip.formalTitle}"`}`;
}
