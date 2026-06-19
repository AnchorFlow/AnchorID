import { SetMetadata } from '@nestjs/common';
import type { AuditAction } from '@anchorid/types';

export const AUDIT_ACTION_KEY = 'auditAction';
export const AuditLogAction = (action: AuditAction, targetType?: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, targetType });
