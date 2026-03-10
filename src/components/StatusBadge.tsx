'use client';

import { clsx } from 'clsx';
import { useTranslation } from '@/lib/i18n';

type Status = 'actif' | 'inactif' | 'en_formation' | 'titulaire' | 'formation' | 'stand_by' | 'absent' | 'remplacement' | 'couvert' | 'non_couvert' | 'confirme' | 'en_attente' | 'annule';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusConfig: Record<Status, { bg: string; text: string; translationKey: string }> = {
  actif: { bg: 'bg-emerald-100', text: 'text-emerald-700', translationKey: 'status.actif' },
  inactif: { bg: 'bg-gray-100', text: 'text-gray-600', translationKey: 'status.inactif' },
  en_formation: { bg: 'bg-blue-100', text: 'text-blue-700', translationKey: 'status.en_formation' },
  titulaire: { bg: 'bg-blue-100', text: 'text-blue-700', translationKey: 'status.titulaire' },
  formation: { bg: 'bg-emerald-100', text: 'text-emerald-700', translationKey: 'status.formation' },
  stand_by: { bg: 'bg-yellow-100', text: 'text-yellow-700', translationKey: 'status.stand_by' },
  absent: { bg: 'bg-red-100', text: 'text-red-700', translationKey: 'status.absent' },
  remplacement: { bg: 'bg-purple-100', text: 'text-purple-700', translationKey: 'status.remplacement' },
  couvert: { bg: 'bg-emerald-100', text: 'text-emerald-700', translationKey: 'status.couvert' },
  non_couvert: { bg: 'bg-red-100', text: 'text-red-700', translationKey: 'status.non_couvert' },
  confirme: { bg: 'bg-emerald-100', text: 'text-emerald-700', translationKey: 'status.confirme' },
  en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', translationKey: 'status.en_attente' },
  annule: { bg: 'bg-red-100', text: 'text-red-700', translationKey: 'status.annule' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status] ?? statusConfig.actif;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bg,
        config.text
      )}
    >
      {label ?? t(config.translationKey)}
    </span>
  );
}
