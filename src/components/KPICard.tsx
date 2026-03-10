import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color?: 'blue' | 'green' | 'red' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
};

export function KPICard({ title, value, icon: Icon, trend, color = 'blue' }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={clsx(
                'mt-1 text-xs font-medium',
                trend.positive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={clsx('rounded-lg p-2.5', colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
