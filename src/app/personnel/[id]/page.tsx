'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  FileText,
  Calendar,
  Loader2,
  Brain,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { ScoreBar } from '@/components/ScoreBar';
import { useTranslation, getDateLocale } from '@/lib/i18n';
import type { Employee } from '@/lib/types';

interface Compatibility {
  client_id: string;
  client_nom: string;
  score: number;
}

export default function PersonnelDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();
  const dateLocale = getDateLocale(locale);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/employees/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('not_found');
          throw new Error('api');
        }
        const json = await res.json();
        setEmployee(json.data);

        // Fetch compatibility data separately via matching endpoint
        const matchRes = await fetch('/api/matching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: 'cli-001', date: new Date().toISOString().split('T')[0] }),
        });
        if (matchRes.ok) {
          const matchJson = await matchRes.json();
          const candidate = matchJson.data?.candidates?.find(
            (c: { employe_id: string }) => c.employe_id === id
          );
          if (candidate) {
            // Use score from the matching engine as a reference
          }
        }

        // For now, generate simple compatibility scores based on client assignments
        const clientsRes = await fetch('/api/clients');
        if (clientsRes.ok) {
          const clientsJson = await clientsRes.json();
          const emp = json.data as Employee;
          const comps: Compatibility[] = clientsJson.data.map(
            (client: { id: string; nom: string; titulaires: string[]; stand_by: string[]; en_formation: string[]; langues_requises: { language: string; minimum_level: string }[]; competences_requises: string[] }) => {
              let score = 50;
              if (client.titulaires.includes(id)) score = 97;
              else if (client.stand_by.includes(id)) score = 85;
              else if (client.en_formation.includes(id)) score = 75;
              else {
                const langMatch = client.langues_requises.filter(
                  (lr: { language: string }) => emp.langues.some((el) => el.language === lr.language)
                ).length;
                score += langMatch * 8;
                const skillMatch = client.competences_requises.filter(
                  (cr: string) => emp.competences.some((ec) => ec.skill === cr)
                ).length;
                score += skillMatch * 5;
                score = Math.min(score, 95);
              }
              return { client_id: client.id, client_nom: client.nom, score };
            }
          );
          comps.sort((a: Compatibility, b: Compatibility) => b.score - a.score);
          setCompatibilities(comps);
        }
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

  if (error || !employee) {
    return (
      <div className="p-8">
        <Link href="/personnel" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> {t('personnel.back')}
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error === 'not_found' ? t('personnel.not_found') : t('common.error_unknown')}
        </div>
      </div>
    );
  }

  const ancienneteLabel = () => {
    const years = Math.floor(employee.anciennete_mois / 12);
    const months = employee.anciennete_mois % 12;
    if (years > 0 && months > 0) {
      return years > 1
        ? t('personnel.anciennete_ans_mois').replace('{n}', String(years)).replace('{m}', String(months))
        : t('personnel.anciennete_an_mois').replace('{n}', String(years)).replace('{m}', String(months));
    }
    if (years > 0) {
      return years > 1
        ? t('personnel.anciennete_ans').replace('{n}', String(years))
        : t('personnel.anciennete_an').replace('{n}', String(years));
    }
    return t('personnel.anciennete_mois').replace('{n}', String(months));
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Back */}
      <Link href="/personnel" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('personnel.back')}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-xl">
            {employee.prenom[0]}{employee.nom[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">
                {employee.prenom} {employee.nom}
              </h1>
              <StatusBadge status={employee.statut} />
            </div>
            <p className="text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">{t('personnel.contrat')}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{employee.type_contrat}</p>
              <p className="text-xs text-gray-500">
                {employee.temps_travail === 'temps_plein' ? t('personnel.temps_plein') : t('personnel.mi_temps')}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">{t('personnel.horaires')}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{employee.heures_hebdo}{t('common.h_sem')}</p>
              <p className="text-xs text-gray-500">
                {employee.heures_planifiees_semaine}h {t('personnel.planifiees')}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">{t('personnel.anciennete')}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{ancienneteLabel()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Phone className="h-4 w-4" />
                <span className="text-xs font-medium">{t('personnel.contact')}</span>
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">{employee.telephone}</p>
              <p className="text-xs text-gray-500 truncate">{employee.email}</p>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              {t('personnel.langues')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {employee.langues.map((l) => (
                <LanguageBadge key={l.language} language={l.language} level={l.level} />
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              {t('personnel.competences')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {employee.competences.map((c) => (
                <span
                  key={c.skill}
                  className="rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-medium text-primary-700"
                >
                  {c.skill.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Formations */}
          {employee.formations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                {t('personnel.formations_certifications')}
              </h2>
              <div className="space-y-2">
                {employee.formations.map((f) => (
                  <div key={f.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{f.name}</p>
                      <p className="text-xs text-gray-500">
                        {t('personnel.obtenue_le')} {new Date(f.date_obtained).toLocaleDateString(dateLocale)}
                        {f.date_expiry && ` - ${t('personnel.expire_le')} ${new Date(f.date_expiry).toLocaleDateString(dateLocale)}`}
                      </p>
                    </div>
                    <StatusBadge
                      status={f.is_valid ? 'actif' : 'inactif'}
                      label={f.is_valid ? t('personnel.valide') : t('personnel.expiree')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: IA Compatibility */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-4 w-4 text-primary-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {t('personnel.clients_compatibles')}
              </h2>
            </div>
            <div className="space-y-3">
              {compatibilities.map((comp) => (
                <div key={comp.client_id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/clients`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate"
                    >
                      {comp.client_nom}
                    </Link>
                  </div>
                  <ScoreBar score={comp.score} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
