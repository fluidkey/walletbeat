import type { ResolvedFeatures } from '@/schema/features';
import { Rating, type Value, type Attribute, type Evaluation } from '@/schema/attributes';
import { Unrated } from '../common';
import { LeaksByDefault } from '@/schema/features/privacy/data-collection';

const brand = 'attributes.privacy.address_correlation';
export type AddressCorrelation = Value & {
  __brand: 'attributes.privacy.address_correlation';
};

const Uncorrelated: AddressCorrelation = {
  id: 'no_correlation',
  rating: Rating.YES,
  display_name: 'None',
  __brand: brand,
};

function Correlated(what: string, rating: Rating): AddressCorrelation {
  return {
    id: `address_and_${what.toLowerCase()}`,
    rating,
    display_name: `Correlated with ${what}`,
    __brand: brand,
  };
}

export const AddressCorrelation: Attribute<AddressCorrelation> = {
  id: 'address_correlation',
  display_name: 'Address',
  explanation_values: [
    Uncorrelated,
    Correlated('IP', Rating.PARTIAL),
    Correlated('phone', Rating.NO),
  ],
  evaluate: (features: ResolvedFeatures): Evaluation<AddressCorrelation> => {
    if (features.privacy.dataCollection === null) {
      return { value: Unrated(brand) };
    }
    for (const collected of features.privacy.dataCollection.collected) {
      if (!LeaksByDefault(collected.leaks.walletAddress)) {
        continue;
      }
      for (const { name, leak } of [
        { name: 'ID', leak: collected.leaks.govId },
        { name: 'address', leak: collected.leaks.address },
        { name: 'face', leak: collected.leaks.face },
        { name: 'phone', leak: collected.leaks.phone },
        { name: 'email', leak: collected.leaks.email },
        { name: 'name', leak: collected.leaks.name },
        { name: 'IP', leak: collected.leaks.ipAddress },
      ]) {
        if (leak >= collected.leaks.walletAddress) {
          return {
            value: Correlated(name, name === 'IP' ? Rating.PARTIAL : Rating.NO),
            url: collected.entity.url,
          };
        }
      }
    }
    return { value: Uncorrelated };
  },
};
