import type { WithRef } from '@/schema/reference';
import type { Url } from '@/schema/url';
import type { Dict } from '@/types/utils/dict';

/**
 * An enum representing when data collection or leak occurs.
 *
 * Values are comparable as integers; the closest to zero, the more privacy.
 */
export enum Leak {
  /** The data is never collected. */
  NEVER = 0,

  /**
   * The wallet does not collect this data by default.
   * The user may decide to enable to this, but this requires explicit user
   * intent to do this.
   */
  OPT_IN = 1,

  /**
   * The wallet does not collect this data by default. However, the
   * wallet will at some point (e.g. during wallet setup) actively ask the
   * user whether or not they want to enable this data collection, without
   * explicit user intent to look for this setting.
   */
  PROMPTED = 2,

  /**
   * The data is collected by default, but the user may turn this off by
   * configuring the wallet appropriately. Doing so requires explicit
   * user intent and knowledge that there is an option to do this in the
   * first place.
   * In order to qualify for this level, it must be possible for the
   * user to access this setting and turn off the collection *before*
   * the first time it happens. For example, a wallet that refreshes
   * crypto prices by default (using a third-party service) and does so
   * before ever giving the user a chance to access the wallet settings
   * to turn off this feature does not qualify for this level.
   */
  BY_DEFAULT = 3,

  /**
   * The data is always collected no matter what the user does.
   */
  ALWAYS = 4,
}

/**
 * How a wallet approaches fetching data for multiple addresses.
 */
export enum MultiAddressPolicy {
  /**
   * If the wallet only handles one active account
   * at a time, and never fetches data about other accounts unless the
   * user actively decides to switch account. In this scenario, the
   * wallet may support multiple addresses, but from a network
   * correlation perspective, these multiple addresses are not
   * correlatable on a timing basis.
   *
   * NOTE 1: Wallets that support multiple accounts often have an
   * "account switcher" view which may refresh all addresses' balance
   * at the same time. If so, this counts as SIMULTANEOUS, since the
   * N requests happen simultaneously when the user opens this switcher.
   *
   * NOTE 2: Wallets using stealth addresses need to handle multiple addresses
   * even for a single logical user account. For such wallets, the concept of
   * "active address" does not make sense, since accounts are abstracted from
   * addresses, and it is critical for such wallets to not allow correlation
   * of the multiple addresses that belong to the same account or user.
   */
  ACTIVE_ADDRESS_ONLY = 'ACTIVE_ADDRESS_ONLY',

  /**
   * If the wallet supports multiple addresses and fetches data for all of
   * them in the same request (bearing all the addresses within).
   */
  SINGLE_REQUEST_WITH_MULTIPLE_ADDRESSES = 'SINGLE_REQUEST_WITH_MULTIPLE_ADDRESSES',

  /**
   * If the wallet supports multiple addresses and fetches data for all of
   * them in separate requests (one per address).
   */
  SEPARATE_REQUEST_PER_ADDRESS = 'SEPARATE_REQUEST_PER_ADDRESS',
}

/**
 * How the wallet handles refreshing data for multiple addresses.
 * This can either be by sending a single request containing all addresses at
 * once, or multiple requests (one per address).
 * Wallets typically need data about multiple addresses at once in the context
 * of refreshing balances, or handling a set of stealth addresses. In either
 * case, there is a risk of allowing third-parties to correlate these
 * addresses together if the requests are not done carefully.
 *
 * If sending multiple requests, the wallet has additional control over how to
 * proxy connections or whether to stagger requests in order to reduce
 * correlatability of the addresses.
 *
 * If the wallet has configuration settings related to this, the setting it
 * should be judged by is the one that applies by default once a second
 * address is added.
 */
export type MultiAddressHandling =
  | {
      /** How the wallet handles refreshing data for multiple addresses. */
      type: MultiAddressPolicy.ACTIVE_ADDRESS_ONLY;
    }
  | {
      /** How the wallet handles refreshing data for multiple addresses. */
      type: MultiAddressPolicy.SINGLE_REQUEST_WITH_MULTIPLE_ADDRESSES;
    }
  | {
      /** How the wallet handles refreshing data for multiple addresses. */
      type: MultiAddressPolicy.SEPARATE_REQUEST_PER_ADDRESS;

      /**
       * Diversity of endpoints on the receiving end of the requests.
       * Is it always the same set of endpoints for all addresses, or is there
       * a pool of multiple endpoints such that each address is only mapped to
       * one of them?
       */
      destination: 'SAME_FOR_ALL' | 'ISOLATED';

      /**
       * How individual requests are proxied: separate circuits (such that they
       * are perceived as coming from different IPs on the destination endpoint),
       * same circuit (same IP perceived on the destination endpoint), or not
       * proxied at all?
       */
      proxy: 'NONE' | 'SAME_CIRCUIT' | 'SEPARATE_CIRCUITS';

      /**
       * Whether individual requests are staggered across time to reduce the
       * ease of correlating them by the destination endpoint.
       *
       * - SIMULTANEOUS: If the wallet makes N simultaneous requests for N
       *   addresses at the same time.
       * - STAGGERED: If the wallet staggers N requests for N addresses
       *   over a period of time (e.g. by waiting a minute between each
       *   request).
       */
      timing: 'SIMULTANEOUS' | 'STAGGERED';
    };

/**
 * @param leak Some leak level.
 * @returns If the data collection happens by default.
 */
export function leaksByDefault(leak: Leak): boolean {
  return leak >= Leak.BY_DEFAULT;
}

/**
 * An entity to which some data may be sent.
 */
export interface Entity {
  /** The name of the entity to which data may be sent. */
  name: string;
  /** Legal name of the entity, if any. */
  legalName: string | null;
  /** Website of the entity to which data may be sent. */
  url: Url | null;
  /** The jurisdiction in which the entity is located. */
  jurisdiction: string | null;
  /** The privacy policy URL of the entity. */
  privacyPolicy: Url | null;
}

export type QualifiedLeaks = Dict<{
  /** Whether the entity may learn the user's IP address. */
  ipAddress: Leak;

  /**
   * Whether the entity may learn the user's activity within the wallet
   * (e.g. mouse click events from analytics like Matomo or Plausible).
   */
  walletActions: Leak;

  /** Whether the entity may learn the user's wallet address. */
  walletAddress: Leak;

  /**
   * How multiple addresses are handled, if at all.
   */
  multiAddress?: MultiAddressHandling;

  /**
   * Whether the entity may learn the user's wallet balances.
   * This can easily be turned back into an address, because most
   * addresses' balance amount is unique.
   */
  walletBalances: Leak;

  /**
   * Whether the entity may learn the set of assets that are in the wallet.
   * On wallets with many NFTs, this can be used to uniquely identify the
   * wallet.
   */
  walletAssets: Leak;

  /**
   * Whether the entity may learn the user's wallet transactions before
   * they are included onchain. For example, MEV protection services
   * usually fall under this category.
   */
  mempoolTransactions: Leak;

  /** Whether the entity may learn a user-selected pseudonym. */
  pseudonym: Leak;

  /** Whether the entity may learn the user's legal name. */
  legalName: Leak;

  /** Whether the entity may learn the user's email. */
  email: Leak;

  /** Whether the entity may learn the user's phone number. */
  phone: Leak;

  /**
   * Whether the entity may learn of the user's contacts
   * (e.g. when searching for friends to invite).
   */
  contacts: Leak;

  /** Whether the entity may learn the user's physical address. */
  physicalAddress: Leak;

  /** Whether the entity may learn the user's face (e.g. KYC selfie). */
  face: Leak;

  /** Whether the entity may learn the user's CEX account(s). */
  cexAccount: Leak;

  /** Whether the entity may learn the user's government-issued ID. */
  govId: Leak;
}>;

export type Leaks = WithRef<Partial<QualifiedLeaks>>;

/**
 * Infer what leaks from a given partial set of known leaks.
 * @param leaks Partial set of known leaks.
 * @returns A fully-qualified set of leaks.
 */
export function inferLeaks(leaks: Partial<Leaks>): WithRef<QualifiedLeaks> {
  const first = (...ls: Array<Leak | undefined>): Leak | undefined => ls.find(l => l !== undefined);
  return {
    ipAddress: leaks.ipAddress ?? Leak.NEVER,
    walletActions: leaks.walletActions ?? Leak.NEVER,
    walletAddress:
      first(leaks.walletAddress, leaks.mempoolTransactions, leaks.walletBalances) ?? Leak.NEVER,
    multiAddress: leaks.multiAddress,
    walletBalances:
      first(leaks.walletBalances, leaks.walletAddress, leaks.mempoolTransactions) ?? Leak.NEVER,
    walletAssets:
      first(
        leaks.walletAssets,
        leaks.walletAddress,
        leaks.walletBalances,
        leaks.mempoolTransactions
      ) ?? Leak.NEVER,
    mempoolTransactions: leaks.mempoolTransactions ?? Leak.NEVER,
    pseudonym: first(leaks.pseudonym, leaks.email) ?? Leak.NEVER, // Email addresses usually contains at least pseudonym-level information.
    legalName: first(leaks.legalName, leaks.govId) ?? Leak.NEVER,
    email: first(leaks.email, leaks.cexAccount) ?? Leak.NEVER,
    phone: first(leaks.phone, leaks.cexAccount) ?? Leak.NEVER,
    contacts: leaks.contacts ?? Leak.NEVER,
    physicalAddress: first(leaks.physicalAddress, leaks.cexAccount, leaks.govId) ?? Leak.NEVER,
    face: first(leaks.face, leaks.govId) ?? Leak.NEVER,
    cexAccount: leaks.cexAccount ?? Leak.NEVER,
    govId: leaks.govId ?? Leak.NEVER,
    ref: leaks.ref,
  };
}

/**
 * Describes the data that an entity may be sent.
 */
export interface EntityData {
  /** The entity to which the data may be sent. */
  entity: Entity;
  /** The type of data that an entity may be sent. */
  leaks: Leaks;
}

/**
 * A collection of data that a wallet collects.
 */
export interface DataCollection {
  /** The data that a wallet collects. */
  collected: EntityData[];
}
