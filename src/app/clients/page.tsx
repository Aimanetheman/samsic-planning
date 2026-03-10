'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Loader2,
  MapPin,
  Clock,
  Users,
  Building2,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { useTranslation } from '@/lib/i18n';
import type { Client, Employee, LanguageLevel } from '@/lib/types';

interface DisplayClient extends Client {
  titulaire_noms: string[];
  couvert: boolean;
}

function priorityColor(p: string) {
  switch (p) {
    case 'haute': return 'bg-red-100 text-red-700';
    case 'moyenne': return 'bg-yellow-100 text-yellow-700';
    case 'basse': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<DisplayClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
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
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (priorityFilter) params.set('priority', priorityFilter);

        const [clientsRes, employeesRes] = await Promise.all([
          fetch(`/api/clients?${params.toString()}`),
          fetch('/api/employees'),
        ]);
        if (!clientsRes.ok) throw new Error('API');
        const clientsJson = await clientsRes.json();
        const employeesJson = employeesRes.ok ? await employeesRes.json() : { data: [] };

        const empMap = new Map<string, Employee>();
        for (const emp of employeesJson.data) {
          empMap.set(emp.id, emp);
        }

        const enriched: DisplayClient[] = clientsJson.data.map((c: Client) => ({
          ...c,
          titulaire_noms: c.titulaires
            .map((tid: string) => {
              const emp = empMap.get(tid);
              return emp ? `${emp.prenom} ${emp.nom}` : null;
            })
            .filter(Boolean) as string[],
          couvert: c.titulaires.length > 0,
        }));

        setClients(enriched);
      } catch {
        setError(t('clients.error_loading'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, priorityFilter, t]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('clients.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('clients.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4" />
          {clients.length} clients
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('clients.search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setLoading(true); }}
              className="appearance-none rounded-lg border border-gray-300 pl-10 pr-8 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="">{t('clients.all_priorities')}</option>
              <option value="haute">{t('clients.haute')}</option>
              <option value="moyenne">{t('clients.moyenne')}</option>
              <option value="basse">{t('clients.basse')}</option>
            </select>
          </div>
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

      {/* Client Cards */}
      {!loading && !error && (
        <>
          {clients.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {t('clients.no_results')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="block bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition-all"
                >
                  {/* Title & Priority */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {client.nom}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColor(client.priorite)}`}>
                      {priorityLabel(client.priorite)}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{client.adresse}</span>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{client.horaire_debut} - {client.horaire_fin}</span>
                  </div>

                  {/* Languages */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">{t('clients.langues_requises')}</p>
                    <div className="flex flex-wrap gap-1">
                      {client.langues_requises.map((l) => (
                        <LanguageBadge
                          key={l.language}
                          language={l.language}
                          level={l.minimum_level as LanguageLevel}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Titulaire & Status */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      {client.titulaire_noms?.length > 0
                        ? client.titulaire_noms.join(', ')
                        : t('clients.non_assigne')}
                    </div>
                    <StatusBadge status={client.couvert ? 'couvert' : 'non_couvert'} />
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
