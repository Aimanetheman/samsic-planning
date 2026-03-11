'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  ArrowRight,
  Brain,
  Loader2,
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { AlertBadge } from '@/components/AlertBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslation } from '@/lib/i18n';
import type { DashboardKPI, Alert, Employee, Client } from '@/lib/types';

interface PlanningItem {
  affectation_id: string;
  client_id: string;
  employe_id: string;
  type: string;
  statut: string;
}

interface DashboardData {
  kpi: DashboardKPI;
  alertes_du_jour: Alert[];
  alertes_non_lues_total: number;
  planning_du_jour: PlanningItem[];
}

function alertPriorityToLevel(priority: string): 'urgent' | 'remplacement' | 'formation' | 'info' {
  switch (priority) {
    case 'urgent': return 'urgent';
    case 'moyen': return 'formation';
    default: return 'info';
  }
}

function alertTypeToLevel(type: string): 'urgent' | 'remplacement' | 'formation' | 'info' {
  switch (type) {
    case 'absence': return 'urgent';
    case 'poste_non_couvert': return 'remplacement';
    case 'formation_expiree': return 'formation';
    default: return 'info';
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [empMap, setEmpMap] = useState<Map<string, Employee>>(new Map());
  const [clientMap, setClientMap] = useState<Map<string, Client>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, alertsRes, empRes, cliRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/alerts'),
          fetch('/api/employees'),
          fetch('/api/clients'),
        ]);
        if (!dashRes.ok) throw new Error('dashboard');
        if (!alertsRes.ok) throw new Error('alerts');
        const dashJson = await dashRes.json();
        const alertsJson = await alertsRes.json();
        setData(dashJson.data);
        setAllAlerts(alertsJson.data);

        if (empRes.ok) {
          const empJson = await empRes.json();
          const map = new Map<string, Employee>();
          for (const emp of empJson.data) map.set(emp.id, emp);
          setEmpMap(map);
        }
        if (cliRes.ok) {
          const cliJson = await cliRes.json();
          const map = new Map<string, Client>();
          for (const cli of cliJson.data) map.set(cli.id, cli);
          setClientMap(map);
        }
      } catch {
        setError('error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {t('dashboard.error')}
        </div>
      </div>
    );
  }

  const unreadAlerts = allAlerts.filter((a) => !a.is_read);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-samsic-dark">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title={t('dashboard.clients_actifs')}
          value={data.kpi.clients_actifs}
          icon={Building2}
          color="blue"
        />
        <KPICard
          title={t('dashboard.employes_actifs')}
          value={data.kpi.employes_actifs}
          icon={Users}
          color="green"
        />
        <KPICard
          title={t('dashboard.absences_today')}
          value={data.kpi.absences_aujourdhui}
          icon={AlertTriangle}
          color={data.kpi.absences_aujourdhui > 0 ? 'orange' : 'green'}
        />
        <KPICard
          title={t('dashboard.postes_non_couverts')}
          value={data.kpi.postes_non_couverts}
          icon={ShieldAlert}
          color={data.kpi.postes_non_couverts > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Urgent Absence Banner */}
      {data.kpi.postes_non_couverts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-red-900">
                {data.kpi.postes_non_couverts} {t('dashboard.postes_non_couverts')}
              </h2>
              <p className="text-sm text-red-700 mt-1">
                {data.kpi.absences_aujourdhui} {t('dashboard.absences_today').toLowerCase()} - {t('dashboard.action_requise')}
              </p>
            </div>
            <Link
              href="/absences"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm flex-shrink-0"
            >
              <Brain className="h-4 w-4" />
              {t('dashboard.traiter_absences')}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              {t('dashboard.alertes_actions')}
            </h2>
            {unreadAlerts.length > 0 && (
              <span className="flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold h-5 min-w-5 px-1.5">
                {unreadAlerts.length}
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {unreadAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                {t('dashboard.no_alerts')}
              </div>
            ) : (
              unreadAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5">
                    <AlertBadge level={alertPriorityToLevel(alert.priority)}>
                      {alert.priority === 'urgent' ? 'URGENT' : alert.priority === 'moyen' ? 'MOYEN' : 'INFO'}
                    </AlertBadge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alert.description}</p>
                  </div>
                  {alert.action_url && (
                    <Link
                      href={alert.action_url}
                      className="text-primary-600 hover:text-primary-700 flex-shrink-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
          {unreadAlerts.length > 5 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <Link href="/alertes" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t('dashboard.voir_alertes')} ({unreadAlerts.length})
              </Link>
            </div>
          )}
        </div>

        {/* Planning du jour */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              {t('dashboard.planning_jour')}
            </h2>
            <Link
              href="/planning"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Calendar className="h-3.5 w-3.5" />
              {t('dashboard.voir_planning')}
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.planning_du_jour.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                {t('dashboard.no_affectations')}
              </div>
            ) : (
              /* Deduplicate by client_id to show one row per client */
              [...new Map(data.planning_du_jour.map((item) => [item.client_id, item])).values()].map((item) => {
                const cli = clientMap.get(item.client_id);
                const emp = empMap.get(item.employe_id);
                return (
                  <Link
                    key={item.affectation_id}
                    href={`/clients/${item.client_id}`}
                    className="block px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cli?.nom ?? item.client_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {emp ? `${emp.prenom} ${emp.nom}` : item.employe_id}
                      </p>
                    </div>
                    <StatusBadge
                      status={item.type as 'titulaire' | 'formation' | 'stand_by' | 'remplacement'}
                    />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
