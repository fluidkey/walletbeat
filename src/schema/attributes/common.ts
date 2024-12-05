import { Rating, type Value } from '../attributes';

/**
 * Helper for constructing "Unrated" values.
 * @param brand Brand string to distinguish `Value` subtypes.
 */
export function Unrated<T>(brand: T): Value & { __brand: T } {
  return {
    id: 'unrated',
    rating: Rating.UNRATED,
    display_name: 'Unrated',
    __brand: brand,
  };
}
