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
  PROMPTED = 2, // eslint-disable-line @typescript-eslint/no-magic-numbers -- Comparable enum value

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
  BY_DEFAULT = 3, // eslint-disable-line @typescript-eslint/no-magic-numbers -- Comparable enum value

  /**
   * The data is always collected, but the user may change their system
   * configuration (e.g. system-wide proxy settings) to avoid this.
   * The wallet itself does not give the user an option to do this.
   */
  UNLESS_SYSTEM_CONFIGURED = 4, // eslint-disable-line @typescript-eslint/no-magic-numbers -- Comparable enum value

  /**
   * The data is always collected no matter what the user does.
   */
  ALWAYS = 5, // eslint-disable-line @typescript-eslint/no-magic-numbers -- Comparable enum value
}

/**
 * @param leak Some leak level.
 * @returns If the data collection happens by default.
 */
export function LeaksByDefault(leak: Leak): boolean {
  return leak >= Leak.BY_DEFAULT;
}

/**
 * An entity to which some data may be sent.
 */
export interface Entity {
  /** The name of the entity to which data may be sent. */
  name: string;
  /** Website of the entity to which data may be sent. */
  url?: string;
  /** The jurisdiction in which the entity is located. */
  jurisdiction?: string;
  /** The privacy policy URL of the entity. */
  privacyPolicy?: string;
}

export interface Leaks {
  /** Whether the entity may learn the user's IP address. */
  ipAddress: Leak;

  /** Whether the entity may learn the user's wallet address. */
  walletAddress: Leak;

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

  /** Whether the entity may learn the user's name. */
  name: Leak;

  /** Whether the entity may learn the user's email. */
  email: Leak;

  /** Whether the entity may learn the user's phone number. */
  phone: Leak;

  /** Whether the entity may learn the user's physical address. */
  address: Leak;

  /** Whether the entity may learn the user's face (e.g. KYC selfie). */
  face: Leak;

  /** Whether the entity may learn the user's CEX account(s). */
  cexAccount: Leak;

  /** Whether the entity may learn the user's government-issued ID. */
  govId: Leak;
}

/**
 * Infer what leaks from a given partial set of known leaks.
 * @param leaks Partial set of known leaks.
 * @returns A fully-qualified set of leaks.
 */
export function InferLeaks(leaks: Partial<Leaks>): Leaks {
  const first = (...ls: Array<Leak | undefined>): Leak | undefined => ls.find(l => l !== undefined);
  return {
    ipAddress: leaks.ipAddress ?? Leak.NEVER,
    walletAddress:
      first(leaks.walletAddress, leaks.mempoolTransactions, leaks.walletBalances) ?? Leak.NEVER,
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
    name: first(leaks.name, leaks.govId) ?? Leak.NEVER,
    address: first(leaks.address, leaks.cexAccount, leaks.govId) ?? Leak.NEVER,
    email: first(leaks.email, leaks.cexAccount) ?? Leak.NEVER,
    phone: first(leaks.phone, leaks.cexAccount) ?? Leak.NEVER,
    face: first(leaks.face, leaks.govId) ?? Leak.NEVER,
    cexAccount: leaks.cexAccount ?? Leak.NEVER,
    govId: leaks.govId ?? Leak.NEVER,
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
