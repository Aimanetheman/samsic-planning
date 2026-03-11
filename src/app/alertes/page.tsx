'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Filter,
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { AlertBadge } from '@/components/AlertBadge';
import { useTranslation } from '@/lib/i18n';
import type { Alert } from '@/lib/types';

function priorityIcon(priority: string) {
  switch (priority) {
    case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'moyen': return <Bell className="h-4 w-4 text-orange-500" />;
    default: return <Info className="h-4 w-4 text-gray-400" />;
  }
}

function priorityToLevel(priority: string): 'urgent' | 'remplacement' | 'formation' | 'info' {
  switch (priority) {
    case 'urgent': return 'urgent';
    case 'moyen': return 'formation';
    default: return 'info';
  }
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState('');
  const { t } = useTranslation();

  const priorityLabel = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'URGENT';
      case 'moyen': return 'MOYEN';
      default: return 'INFO';
    }
  };

  const timeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('alertes.a_linstant');
    if (diffMins < 60) return t('alertes.il_y_a_min').replace('{n}', String(diffMins));
    if (diffHours < 24) return t('alertes.il_y_a_h').replace('{n}', String(diffHours));
    if (diffDays === 1) return t('alertes.hier');
    return t('alertes.il_y_a_jours').replace('{n}', String(diffDays));
  };

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (priorityFilter) params.set('priority', priorityFilter);

        const res = await fetch(`/api/alerts?${params.toString()}`);
        if (!res.ok) throw new Error('API');
        const json = await res.json();
        setAlerts(json.data);
      } catch {
        setError(t('alertes.error_loading'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [priorityFilter, t]);

  const markAsRead = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
        );
      }
    } catch {
      // Silent fail for mark-as-read
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('alertes.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} ${t('alertes.non_lues')}`
              : t('alertes.toutes_lues')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Bell className="h-4 w-4" />
          {alerts.length} {t('alertes.total')}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setLoading(true); }}
            className="appearance-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">{t('alertes.all_priorities')}</option>
            <option value="urgent">{t('alertes.urgent')}</option>
            <option value="moyen">{t('alertes.moyen')}</option>
            <option value="info">{t('alertes.info')}</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Alerts List */}
      {!loading && !error && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {t('alertes.no_results')}
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'bg-white rounded-xl border shadow-sm p-5 transition-all',
                  alert.is_read
                    ? 'border-gray-200 opacity-70'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{priorityIcon(alert.priority)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertBadge level={priorityToLevel(alert.priority)}>
                        {priorityLabel(alert.priority)}
                      </AlertBadge>
                      <span className="text-xs text-gray-400">{timeAgo(alert.created_at)}</span>
                      {alert.is_read && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {t('alertes.lu')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {alert.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {alert.action_url && (
                      <Link
                        href={alert.action_url}
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                          alert.action_url.startsWith('/matching')
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                        )}
                      >
                        {alert.action_url.startsWith('/matching')
                          ? t('alertes.trouver_remplacement')
                          : t('alertes.action')}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {t('alertes.marquer_lu')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
