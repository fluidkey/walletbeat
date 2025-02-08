import type { EvaluationData } from '@/schema/attributes';
import { component, type Renderable } from '../content';
import type { SecurityAuditsValue } from '@/schema/attributes/security/security-audits';

export interface SecurityAuditsDetailsProps extends EvaluationData<SecurityAuditsValue> {
  auditedInLastYear: boolean;
  hasUnaddressedFlaws: boolean;
}

export interface SecurityAuditsDetailsContent {
  component: 'SecurityAuditsDetails';
  componentProps: SecurityAuditsDetailsProps;
}

export function securityAuditsDetailsContent(
  bakedProps: Omit<SecurityAuditsDetailsProps, keyof EvaluationData<SecurityAuditsValue>>
): Renderable<EvaluationData<SecurityAuditsValue>> {
  return component<SecurityAuditsDetailsContent, keyof typeof bakedProps>(
    'SecurityAuditsDetails',
    bakedProps
  );
}
