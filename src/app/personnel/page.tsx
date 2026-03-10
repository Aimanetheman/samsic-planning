'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Loader2, Users } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { useTranslation } from '@/lib/i18n';
import type { Employee } from '@/lib/types';

export default function PersonnelPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        if (langFilter) params.set('language', langFilter);

        const res = await fetch(`/api/employees?${params.toString()}`);
        if (!res.ok) throw new Error('API');
        const json = await res.json();
        setEmployees(json.data);
      } catch {
        setError(t('personnel.error_loading'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, statusFilter, langFilter, t]);

  const contractLabel = (type: string) => {
    switch (type) {
      case 'CDI': return 'CDI';
      case 'CDD': return 'CDD';
      case 'interim': return 'Interim';
      default: return type;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('personnel.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('personnel.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {employees.length} {t('personnel.employes')}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('personnel.search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
              className="appearance-none rounded-lg border border-gray-300 pl-10 pr-8 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="">{t('personnel.all_statuses')}</option>
              <option value="actif">{t('personnel.actif')}</option>
              <option value="inactif">{t('personnel.inactif')}</option>
              <option value="en_formation">{t('personnel.en_formation')}</option>
            </select>
          </div>

          {/* Language filter */}
          <select
            value={langFilter}
            onChange={(e) => { setLangFilter(e.target.value); setLoading(true); }}
            className="appearance-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">{t('personnel.all_languages')}</option>
            <option value="FR">{t('personnel.francais')}</option>
            <option value="EN">{t('personnel.anglais')}</option>
            <option value="DE">{t('personnel.allemand')}</option>
            <option value="LU">{t('personnel.luxembourgeois')}</option>
            <option value="PT">{t('personnel.portugais')}</option>
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

      {/* Employees Grid */}
      {!loading && !error && (
        <>
          {employees.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {t('personnel.no_results')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <Link
                  key={emp.id}
                  href={`/personnel/${emp.id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm group-hover:bg-primary-200 transition-colors">
                      {emp.prenom[0]}{emp.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {emp.prenom} {emp.nom}
                        </h3>
                        <StatusBadge status={emp.statut} />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {contractLabel(emp.type_contrat)} - {emp.temps_travail === 'temps_plein' ? t('personnel.temps_plein') : t('personnel.mi_temps')} ({emp.heures_hebdo}{t('common.h_sem')})
                      </p>

                      {/* Languages */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {emp.langues.map((l) => (
                          <LanguageBadge key={l.language} language={l.language} level={l.level} />
                        ))}
                      </div>

                      {/* Skills preview */}
                      <div className="flex flex-wrap gap-1">
                        {emp.competences.slice(0, 3).map((c) => (
                          <span key={c.skill} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                            {c.skill.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {emp.competences.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{emp.competences.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
