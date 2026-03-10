import { clsx } from 'clsx';
import type { LanguageLevel } from '@/lib/types';

interface LanguageBadgeProps {
  language: string;
  level: LanguageLevel;
}

const levelConfig: Record<LanguageLevel, { bg: string; text: string; label: string }> = {
  natif: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Natif' },
  courant: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Courant' },
  intermediaire: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Intermediaire' },
  notions: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Notions' },
};

export function LanguageBadge({ language, level }: LanguageBadgeProps) {
  const config = levelConfig[level];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      <span className="font-semibold">{language}</span>
      <span className="opacity-70">({config.label})</span>
    </span>
  );
}
