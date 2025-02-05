import { remap } from './remap';

/**
 * A Partial<Record<K, V>> that is guaranteed to have at least one element.
 */
export type NonEmptyRecord<K extends string | number | symbol, V> = {
  [P in K]: Record<P, V> & Partial<Record<Exclude<K, P>, V>>;
}[K];

/**
 * An array that is guaranteed to have at least one element.
 */
export type NonEmptyArray<T> = T[] & ([T, ...T[]] | [...T[], T]);

/** Type predicate for NonEmptyArray. */
export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0;
}

/**
 * Like Object.keys but guarantees at least one key.
 * @param rec The record to get the keys from.
 * @returns A non-empty array of keys.
 */
export function nonEmptyKeys<
  K extends string | number | symbol,
  V,
  R extends NonEmptyRecord<K, V> = NonEmptyRecord<K, V>,
>(rec: R): NonEmptyArray<keyof R> {
  return Object.keys(rec) as NonEmptyArray<keyof R>; // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we know the input record was non-empty.
}

/**
 * Like Object.values but guarantees at least one value.
 * @param rec The record to get the values from.
 * @returns A non-empty array of values.
 */
export function nonEmptyValues<K extends string | number | symbol, V>(
  rec: NonEmptyRecord<K, V>
): NonEmptyArray<V> {
  return Object.values(rec) as NonEmptyArray<V>; // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we know the input record was non-empty.
}

/**
 * Like Object.entries but guarantees at least one entry.
 * @param rec The record to get the entries from.
 * @returns A non-empty array of entries.
 */
export function nonEmptyEntries<
  K extends string | number | symbol,
  V,
  R extends NonEmptyRecord<K, V> = NonEmptyRecord<K, V>,
>(rec: R): NonEmptyArray<[keyof R, V]> {
  return Object.entries(rec) as NonEmptyArray<[keyof R, V]>; // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we know the input record was non-empty.
}

/**
 * Like Array.map but guarantees at least one element.
 * @param arr The array to map over.
 * @param fn A mapping function that is guaranteed to be called at least once.
 */
export function nonEmptyMap<T, R>(
  arr: NonEmptyArray<T>,
  fn: (val: T, index: number) => R
): NonEmptyArray<R> {
  return arr.map(fn) as NonEmptyArray<R>; // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we know the input array was non-empty.
}

/**
 * Apply a map function to each element of a NonEmptyRecord.
 * @param rec The non-empty record to apply `map` to.
 * @param map The map function.
 * @returns A non-empty record with the same keys as `rec` and mapped values.
 */
export function nonEmptyRemap<K extends string | number | symbol, V1, V2>(
  rec: NonEmptyRecord<K, V1>,
  map: (k: K, v: V1) => V2
): NonEmptyRecord<K, V2> {
  return remap(rec, map);
}

/**
 * Get an element of the array. Guaranteed to be defined since the array is
 * non-empty.
 * @param arr The array from which to get the element.
 * @returns An element of the array.
 */
export function nonEmptyGet<T>(arr: NonEmptyArray<T>): T {
  return arr[0];
}

/** Return a sorted copy of the array. */
export function nonEmptySorted<T>(
  arr: NonEmptyArray<T>,
  compare: (a: T, b: T) => number,
  reverse?: boolean
): NonEmptyArray<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we know the input array was non-empty.
  const arrCopy = [...arr] as NonEmptyArray<T>;
  arrCopy.sort(reverse === true ? (a, b) => compare(b, a) : compare);
  return arrCopy;
}

/**
 * Get the first element of the array as sorted by the given comparison
 * function. Does not modify the original array.
 * @param arr The array from which to get the element.
 * @param compare The comparison function.
 * @param reverse Whether to sort in descending order.
 * @returns The first element of the array if it was sorted.
 */
export function nonEmptyFirst<T>(
  arr: NonEmptyArray<T>,
  compare: (a: T, b: T) => number,
  reverse?: boolean
): T {
  return nonEmptySorted(arr, compare)[reverse === true ? arr.length - 1 : 0];
}

/**
 * Concatenate a non-empty array and an array together.
 */
export function nonEmptyConcat<T>([arr, rest]:
  | [T[], NonEmptyArray<T>]
  | [NonEmptyArray<T>, T[]]): NonEmptyArray<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe because we know one of the two input arrays was non-empty.
  return arr.concat(...rest) as NonEmptyArray<T>;
}
