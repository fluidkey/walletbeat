'use client';

import type React from 'react';
import { type Content, isTypographicContent } from '@/types/content';
import { RenderTypographicContent } from './RenderTypographicContent';
import { AddressCorrelationDetails } from '../molecules/attributes/privacy/AddressCorrelationDetails';
import { ChainVerificationDetails } from '../molecules/attributes/security/ChainVerificationDetails';
import { FundingDetails } from '../molecules/attributes/transparency/FundingDetails';
import { LicenseDetails } from '../molecules/attributes/transparency/LicenseDetails';
import { SourceVisibilityDetails } from '../molecules/attributes/transparency/SourceVisibilityDetails';
import { UnratedAttribute } from '../molecules/attributes/UnratedAttribute';
import { SecurityAuditsDetails } from '../molecules/attributes/security/SecurityAuditsDetails';
import { TransactionInclusionDetails } from '../molecules/attributes/self-sovereignty/TransactionInclusionDetails';

export function RenderContent({
  content,
  ...otherProps
}:
  | { content: Content }
  | React.ComponentProps<typeof RenderTypographicContent>): React.JSX.Element {
  if (isTypographicContent(content)) {
    return <RenderTypographicContent content={content} {...otherProps} />;
  }
  const { component, componentProps } = content.component;
  switch (component) {
    case 'AddressCorrelationDetails':
      return <AddressCorrelationDetails {...componentProps} {...otherProps} />;
    case 'ChainVerificationDetails':
      return <ChainVerificationDetails {...componentProps} {...otherProps} />;
    case 'FundingDetails':
      return <FundingDetails {...componentProps} {...otherProps} />;
    case 'LicenseDetails':
      return <LicenseDetails {...componentProps} {...otherProps} />;
    case 'SecurityAuditsDetails':
      return <SecurityAuditsDetails {...componentProps} {...otherProps} />;
    case 'SourceVisibilityDetails':
      return <SourceVisibilityDetails {...componentProps} {...otherProps} />;
    case 'TransactionInclusionDetails':
      return <TransactionInclusionDetails {...componentProps} {...otherProps} />;
    case 'UnratedAttribute':
      return <UnratedAttribute {...componentProps} {...otherProps} />;
  }
}
