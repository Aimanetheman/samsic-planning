'use client';

import { clsx } from 'clsx';
import { useTranslation } from '@/lib/i18n';
import type { AffectationType } from '@/lib/types';

interface PlanningCellProps {
  employeeName: string | null;
  type: AffectationType | 'absent' | null;
  hasAbsence?: boolean;
  onClickAbsence?: () => void;
}

const typeStyles: Record<string, { bg: string; border: string; text: string; labelKey: string }> = {
  titulaire: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', labelKey: 'planning.titulaire' },
  formation: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', labelKey: 'planning.en_formation' },
  stand_by: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', labelKey: 'planning.stand_by' },
  remplacement: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', labelKey: 'planning.remplacement' },
  absent: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', labelKey: 'planning.absent' },
};

export function PlanningCell({ employeeName, type, hasAbsence, onClickAbsence }: PlanningCellProps) {
  const { t } = useTranslation();

  if (!employeeName && !type) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2.5 h-full min-h-[60px] flex items-center justify-center">
        <span className="text-xs text-gray-400">--</span>
      </div>
    );
  }

  const style = type ? typeStyles[type] ?? typeStyles.titulaire : typeStyles.titulaire;

  return (
    <div
      className={clsx(
        'rounded-lg border p-2.5 h-full min-h-[60px] flex flex-col justify-center gap-1',
        style.bg,
        style.border,
        hasAbsence && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={hasAbsence ? onClickAbsence : undefined}
      role={hasAbsence ? 'button' : undefined}
      tabIndex={hasAbsence ? 0 : undefined}
      onKeyDown={hasAbsence ? (e) => { if (e.key === 'Enter') onClickAbsence?.(); } : undefined}
    >
      <span
        className={clsx(
          'text-sm font-medium',
          type === 'absent' ? 'line-through text-red-400' : 'text-gray-900'
        )}
      >
        {employeeName}
      </span>
      <span className={clsx('text-xs font-semibold', style.text)}>
        {t(style.labelKey)}
      </span>
      {hasAbsence && (
        <span className="text-xs text-red-500 font-medium mt-0.5">
          {t('planning.suggestion_ia')}
        </span>
      )}
    </div>
  );
}
