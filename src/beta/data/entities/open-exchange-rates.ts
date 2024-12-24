import type { Entity } from '@/beta/schema/features/privacy/data-collection';

export const openExchangeRates: Entity = {
  name: 'Open Exchange Rates',
  legalName: { name: 'Open Exchange Rates Ltd', soundsDifferent: false },
  jurisdiction: null, // Unclear
  url: 'https://openexchangerates.org/',
  privacyPolicy: 'https://openexchangerates.org/privacy',
  crunchbase: 'https://www.crunchbase.com/organization/open-exchange-rates',
};
