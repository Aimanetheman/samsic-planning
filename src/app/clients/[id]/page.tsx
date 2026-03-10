'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  UserCheck,
  UserCog,
  GraduationCap,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { useTranslation } from '@/lib/i18n';
import type { Client, Employee, LanguageLevel } from '@/lib/types';

interface ClientDetail extends Client {
  titulaires_details: Employee[];
  stand_by_details: Employee[];
  en_formation_details: Employee[];
}

function priorityColor(p: string) {
  switch (p) {
    case 'haute': return 'bg-red-100 text-red-700';
    case 'moyenne': return 'bg-yellow-100 text-yellow-700';
    case 'basse': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const priorityLabel = (p: string) => {
    switch (p) {
      case 'haute': return t('clients.haute');
      case 'moyenne': return t('clients.moyenne');
      case 'basse': return t('clients.basse');
      default: return p;
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('not_found');
          throw new Error('api');
        }
        const json = await res.json();
        setClient(json.data);
      } catch (e) {
        setError(e instanceof Error && e.message === 'not_found' ? 'not_found' : 'unknown');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8">
        <Link href="/clients" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> {t('clients.back')}
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error === 'not_found' ? t('clients.not_found') : t('common.error_unknown')}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Back */}
      <Link href="/clients" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('clients.back')}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{client.nom}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityColor(client.priorite)}`}>
                {priorityLabel(client.priorite)}
              </span>
              <StatusBadge status={client.titulaires.length > 0 ? 'couvert' : 'non_couvert'} />
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{client.adresse}</span>
            </div>
          </div>
          <Link
            href={`/matching?client=${id}&date=${today}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            {t('clients.find_replacement')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">{t('clients.horaires')}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {client.horaire_debut} - {client.horaire_fin}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">{t('clients.total_assigned')}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {client.titulaires.length + client.stand_by.length + client.en_formation.length}
              </p>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              {t('clients.langues_requises')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {client.langues_requises.map((l) => (
                <LanguageBadge
                  key={l.language}
                  language={l.language}
                  level={l.minimum_level as LanguageLevel}
                />
              ))}
              {client.langues_requises.length === 0 && (
                <span className="text-sm text-gray-400">{t('clients.aucune_langue')}</span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              {t('clients.competences_requises')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {client.competences_requises.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-medium text-primary-700"
                >
                  {c.replace(/_/g, ' ')}
                </span>
              ))}
              {client.competences_requises.length === 0 && (
                <span className="text-sm text-gray-400">{t('clients.aucune_competence')}</span>
              )}
            </div>
          </div>

          {/* Certifications */}
          {client.certifications_requises.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                {t('clients.certifications_requises')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {client.certifications_requises.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: assigned employees */}
        <div className="space-y-6">
          {/* Titulaires */}
          <EmployeeSection
            icon={UserCheck}
            titleKey="clients.titulaires"
            employees={client.titulaires_details ?? []}
            emptyKey="clients.aucun_titulaire"
            t={t}
          />

          {/* Stand-by */}
          <EmployeeSection
            icon={UserCog}
            titleKey="clients.stand_by_label"
            employees={client.stand_by_details ?? []}
            emptyKey="clients.aucun_stand_by"
            t={t}
          />

          {/* En formation */}
          <EmployeeSection
            icon={GraduationCap}
            titleKey="clients.en_formation_label"
            employees={client.en_formation_details ?? []}
            emptyKey="clients.aucun_en_formation"
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

/** Reusable section showing a list of employees for a given role */
function EmployeeSection({
  icon: Icon,
  titleKey,
  employees,
  emptyKey,
  t,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  employees: Employee[];
  emptyKey: string;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary-500" />
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {t(titleKey)}
        </h2>
        <span className="ml-auto text-xs text-gray-400">{employees.length}</span>
      </div>
      {employees.length === 0 ? (
        <p className="text-sm text-gray-400">{t(emptyKey)}</p>
      ) : (
        <div className="space-y-2">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              href={`/personnel/${emp.id}`}
              className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-xs">
                {emp.prenom[0]}{emp.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {emp.prenom} {emp.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">{emp.email}</p>
              </div>
              <StatusBadge status={emp.statut} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
