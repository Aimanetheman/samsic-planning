import { clsx } from 'clsx';

type AlertLevel = 'urgent' | 'remplacement' | 'formation' | 'info';

interface AlertBadgeProps {
  level: AlertLevel;
  children: React.ReactNode;
}

const badgeStyles: Record<AlertLevel, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  remplacement: 'bg-blue-100 text-blue-700 border-blue-200',
  formation: 'bg-orange-100 text-orange-700 border-orange-200',
  info: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function AlertBadge({ level, children }: AlertBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        badgeStyles[level]
      )}
    >
      {children}
    </span>
  );
}
