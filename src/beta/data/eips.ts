import type { Eip, EipNumber } from '../schema/eips';
import { eip1193 } from './eips/eip-1193';
import { eip2700 } from './eips/eip-2700';
import { eip6963 } from './eips/eip-6963';
import { erc7828 } from './eips/erc-7828';
import { erc7831 } from './eips/erc-7831';

/**
 * All EIPs tracked by Walletbeat.
 */
export const eips: Record<EipNumber, Eip> = {
  '1193': eip1193,
  '2700': eip2700,
  '6963': eip6963,
  '7828': erc7828,
  '7831': erc7831,
};

/** Resolve an EIP from an EIP number. */
export function getEip(eip: EipNumber | Eip): Eip {
  if (typeof eip !== 'string') {
    return eip;
  }
  return eips[eip];
}
