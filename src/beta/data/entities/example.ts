import type { Entity } from '@/beta/schema/features/privacy/data-collection';

export const exampleNodeCompany: Entity = {
  name: 'Example RPC Company',
  legalName: { name: 'Example RPC Corp', soundsDifferent: false },
  jurisdiction: 'Atlantis',
  url: 'https://example.com/',
  privacyPolicy: 'https://example.com/privacy',
  crunchbase: null,
};

export const exampleCex: Entity = {
  name: 'Example Centralized Exchange',
  legalName: { name: 'Example Centralized Exchange Corp', soundsDifferent: false },
  jurisdiction: 'Atlantis',
  url: 'https://example.com/',
  privacyPolicy: 'https://example.com/privacy',
  crunchbase: null,
};
