import type { OpportunityStatus } from '@/lib/types';
import { STATUS_OPTIONS } from '@/lib/types';

interface StatusBadgeProps {
  status: OpportunityStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  const color = opt?.color ?? '#9CA3AF';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {status}
    </span>
  );
}
