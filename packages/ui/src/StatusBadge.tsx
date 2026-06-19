import { cn } from './cn';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const STATUS_TONE_MAP: Record<string, StatusTone> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  ACCEPTED: 'success',
  PENDING: 'warning',
  IN_REVIEW: 'warning',
  PROCESSING: 'warning',
  REJECTED: 'danger',
  DENIED: 'danger',
  SUSPENDED: 'danger',
  REVOKED: 'danger',
  EXPIRED: 'neutral',
  DEACTIVATED: 'neutral',
};

export function statusToTone(status: string): StatusTone {
  return STATUS_TONE_MAP[status] ?? 'neutral';
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusToTone(status);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
