'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  Brain,
  Loader2,
  CheckCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation, getDateLocale } from '@/lib/i18n';
import type { Absence, Employee, Client } from '@/lib/types';

const channelIcons: Record<string, typeof Phone> = {
  telephone: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  sms: MessageSquare,
};

const typeColors: Record<string, string> = {
  maladie: 'bg-red-100 text-red-700 border-red-200',
  imprevue: 'bg-orange-100 text-orange-700 border-orange-200',
  conge: 'bg-blue-100 text-blue-700 border-blue-200',
  autre: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  ouverte: { color: 'text-red-600', icon: ShieldAlert },
  couverte: { color: 'text-emerald-600', icon: CheckCircle },
  non_couverte: { color: 'text-orange-600', icon: AlertTriangle },
};

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [empMap, setEmpMap] = useState<Map<string, Employee>>(new Map());
  const [clientMap, setClientMap] = useState<Map<string, Client>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();
  const dateLocaleStr = getDateLocale(locale);

  useEffect(() => {
    async function load() {
      try {
        const [absRes, empRes, cliRes] = await Promise.all([
          fetch('/api/absences'),
          fetch('/api/employees'),
          fetch('/api/clients'),
        ]);
        if (!absRes.ok) throw new Error('absences');
        const absJson = await absRes.json();
        setAbsences(absJson.data);

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
        setError(t('absences.error_loading'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAbsences = absences.filter((a) => a.date === todayStr);
  const futureAbsences = absences.filter((a) => a.date > todayStr);
  const openCount = absences.filter((a) => a.statut === 'ouverte' || a.statut === 'non_couverte').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>
      </div>
    );
  }

  function renderAbsenceCard(absence: Absence) {
    const emp = empMap.get(absence.employe_id);
    const cli = clientMap.get(absence.client_id);
    const ChannelIcon = channelIcons[absence.channel] ?? Phone;
    const statusCfg = statusConfig[absence.statut] ?? statusConfig.ouverte;
    const StatusIcon = statusCfg.icon;
    const isOpen = absence.statut === 'ouverte' || absence.statut === 'non_couverte';

    return (
      <div
        key={absence.id}
        className={clsx(
          'bg-white rounded-xl border shadow-sm p-5 transition-all',
          isOpen ? 'border-red-200 hover:border-red-300' : 'border-gray-200 opacity-75'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Left: icon + status */}
          <div className="flex flex-col items-center gap-1">
            <div className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isOpen ? 'bg-red-100' : 'bg-emerald-100'
            )}>
              <StatusIcon className={clsx('h-5 w-5', statusCfg.color)} />
            </div>
          </div>

          {/* Center: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {emp ? `${emp.prenom} ${emp.nom}` : absence.employe_id}
              </span>
              <span className={clsx('text-[10px] font-bold uppercase rounded-full border px-2 py-0.5', typeColors[absence.type])}>
                {absence.type === 'maladie' ? t('absences.type_maladie') :
                 absence.type === 'imprevue' ? t('absences.type_imprevue') :
                 absence.type === 'conge' ? t('absences.type_conge') : absence.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {cli?.nom ?? absence.client_id}
              {' - '}
              {new Date(absence.date).toLocaleDateString(dateLocaleStr, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            {absence.notes && (
              <p className="text-xs text-gray-500 italic mb-2">{absence.notes}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <ChannelIcon className="h-3 w-3" />
                {absence.channel}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(absence.created_at).toLocaleTimeString(dateLocaleStr, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Right: action */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={clsx(
              'text-xs font-bold uppercase',
              absence.statut === 'couverte' ? 'text-emerald-600' : 'text-red-600'
            )}>
              {absence.statut === 'ouverte' ? t('absences.statut_ouverte') :
               absence.statut === 'couverte' ? t('absences.statut_couverte') :
               t('absences.statut_non_couverte')}
            </span>
            {isOpen && (
              <Link
                href={`/matching?client=${absence.client_id}&date=${absence.date}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Brain className="h-3.5 w-3.5" />
                {t('absences.trouver_remplacement')}
              </Link>
            )}
            {absence.statut === 'couverte' && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" />
                {t('absences.remplacement_confirme')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('absences.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {openCount > 0
              ? `${openCount} ${t('absences.a_traiter')}`
              : t('absences.toutes_couvertes')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold h-6 min-w-6 px-2">
              {openCount}
            </span>
          )}
        </div>
      </div>

      {/* Today's absences */}
      {todayAbsences.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {t('absences.aujourdhui')} ({todayAbsences.length})
            </h2>
          </div>
          <div className="space-y-3">
            {todayAbsences.map(renderAbsenceCard)}
          </div>
        </div>
      )}

      {/* Future absences */}
      {futureAbsences.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {t('absences.a_venir')} ({futureAbsences.length})
            </h2>
          </div>
          <div className="space-y-3">
            {futureAbsences.map(renderAbsenceCard)}
          </div>
        </div>
      )}

      {absences.length === 0 && (
        <div className="text-center py-20 text-gray-400 text-sm">
          {t('absences.aucune')}
        </div>
      )}
    </div>
  );
}
