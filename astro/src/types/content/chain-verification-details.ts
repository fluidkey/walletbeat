import type { ChainVerificationValue } from '@/schema/attributes/security/chain-verification';
import type { NonEmptyArray } from '../utils/non-empty';
import type { EthereumL1LightClient } from '@/schema/features/security/light-client';
import type { FullyQualifiedReference } from '@/schema/reference';
import type { EvaluationData } from '@/schema/attributes';
import { component, type Renderable } from '../content';

export interface ChainVerificationDetailsProps extends EvaluationData<ChainVerificationValue> {
  lightClients: NonEmptyArray<EthereumL1LightClient>;
  refs: FullyQualifiedReference[];
}

export interface ChainVerificationDetailsContent {
  component: 'ChainVerificationDetails';
  componentProps: ChainVerificationDetailsProps;
}

export function chainVerificationDetailsContent(
  bakedProps: Omit<ChainVerificationDetailsProps, keyof EvaluationData<ChainVerificationValue>>
): Renderable<EvaluationData<ChainVerificationValue>> {
  return component<ChainVerificationDetailsContent, keyof typeof bakedProps>(
    'ChainVerificationDetails',
    bakedProps
  );
}
