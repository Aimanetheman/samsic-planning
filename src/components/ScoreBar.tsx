import { clsx } from 'clsx';

interface ScoreBarProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 90) return 'text-emerald-700';
  if (score >= 70) return 'text-yellow-700';
  if (score >= 50) return 'text-orange-700';
  return 'text-red-700';
}

export function ScoreBar({ score, size = 'md', showLabel = true }: ScoreBarProps) {
  const heightMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div className="flex items-center gap-3">
      <div className={clsx('flex-1 rounded-full bg-gray-200', heightMap[size])}>
        <div
          className={clsx('rounded-full transition-all duration-300', heightMap[size], getScoreColor(score))}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      {showLabel && (
        <span className={clsx('text-sm font-bold tabular-nums min-w-[3ch] text-right', getScoreTextColor(score))}>
          {score}%
        </span>
      )}
    </div>
  );
}

export { getScoreColor, getScoreTextColor };
