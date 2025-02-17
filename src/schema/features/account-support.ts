import type { WithRef } from '../reference';

export type AccountTypeSupported<T> = WithRef<{ support: 'SUPPORTED' } & T>;
export type AccountTypeNotSupported = WithRef<{ support: 'NOT_SUPPORTED' }>;

export type AccountTypeSupport<T> = AccountTypeSupported<T> | AccountTypeNotSupported;

/** Type predicate for AccountTypeSupported<T>. */
export function isAccountTypeSupported<T>(
  accountTypeSupport: AccountTypeSupport<T>
): accountTypeSupport is AccountTypeSupported<T> {
  return accountTypeSupport.support === 'SUPPORTED';
}

/** Set of possible account types. */
export enum AccountType {
  /** EOA account type, behind a private key. */
  eoa = 'eoa',

  /** MPC wallets, behind a key with split shards. */
  mpc = 'mpc',

  /** EOA account that is used as a smart contract account with EIP-7702. */
  eip7702 = 'eip7702',

  /**
   * Raw ERC-4337 account, i.e. an account for which the address matches the
   * smart contract code.
   */
  rawErc4337 = 'rawErc4337',
}

/** Account support features. */
export type AccountSupport = Exclude<
  {
    /**
     * Support for raw EOA accounts.
     * Leave as NOT_SUPPORTED if the wallet only supports EIP-7702-type EOAs.
     */
    eoa: AccountTypeSupport<AccountTypeEoa>;

    /** Support for MPC-based (sharded key) accounts. */
    mpc: AccountTypeSupport<AccountTypeMpc>;

    /**
     * Support for EIP-7702 EOA accounts.
     * This usually also implies `rawEoa` support.
     */
    eip7702: AccountTypeSupport<AccountType7702>;

    /**
     * Support for smart accounts (pure ERC-4337 accounts for which the
     * address matches the contract code).
     */
    rawErc4337: AccountTypeSupport<AccountTypeMutableMultifactor>;
  },
  // At least one account type must be supported.
  Record<AccountType, AccountTypeNotSupported>
> &
  (
    | {
        // Either EIP-7702 is not supported...
        eip7702: AccountTypeNotSupported;
      }
    | ({
        // Or EIP-7702 is supported, in which case either EOA or MPC accounts
        // (or both) must be supported.
        eip7702: AccountTypeSupported<AccountType7702>;
      } & (
        | {
            eoa: AccountTypeSupported<AccountTypeEoa>;
          }
        | {
            mpc: AccountTypeSupported<AccountTypeMpc>;
          }
      ))
  );

/** Support information for EOA accounts. */
export interface AccountTypeEoa {
  /** Type of standards used to deterministically derive private keys. */
  keyDerivation:
    | {
        type: 'NONSTANDARD';
      }
    | {
        type: 'BIP32';
        seedPhrase: 'NONSTANDARD' | 'BIP39';
        derivationPath: 'NONSTANDARD' | 'BIP44';
        canExportSeedPhrase: boolean;
      };
  /** Can the wallet export EOA private keys directly? */
  canExportPrivateKey: boolean;
}

interface AccountTypeMultifactor {
  /**
   * Can a single third-party unilaterally take over the account or withdraw
   * any asset?
   */
  singleThirdPartyCanRug: 'NO' | 'ALWAYS' | 'IF_EXPLICITLY_PREAPPROVED';

  /**
   * Is it possible to create and broadcast an Ethereum transaction that
   * withdraws any type of asset from the account to transfer it out to
   * another address, without the help of a third-party?
   *
   * This implies that the code to create such a transaction is open-source
   * and does not rely on any network request to a proprietary API or service.
   */
  tokenTransferTransactionCanBeGeneratedWithoutThirdParty: boolean;
}

/**
 * Support information for accounts with multiple authentication factors
 * where the factors cannot be mutated.
 */
export type AccountTypeMpc = AccountTypeMultifactor & {
  /** How is the underlying key generation performed before shares are distributed? */
  initialKeyGeneration: 'ON_USER_DEVICE' | 'BY_THIRD_PARTY_IN_THE_CLEAR' | 'BY_THIRD_PARTY_IN_TEE';
};

/**
 * Support information for accounts with multiple authentication factors
 * where the factors can be mutated.
 */
export type AccountTypeMutableMultifactor = AccountTypeMultifactor & {
  /**
   * Is it possible to create and broadcast an Ethereum transaction that
   * rotates one of the factors used to control the account without relying
   * on a third-party?
   *
   * This implies that the code to create such a transaction is open-source
   * and does not rely on any network request to a proprietary API or service.
   */
  keyRotationTransactionCanBeGeneratedWithoutThirdParty: boolean;
};

/**
 * Support information for EIP-7702 accounts.
 */
export interface AccountType7702 {
  /**
   * Information about the contract code that the wallet uses with EIP-7702
   * transactions.
   */
  contractCode: AccountTypeMutableMultifactor;
}
