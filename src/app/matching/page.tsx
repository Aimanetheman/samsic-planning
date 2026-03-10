'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  Clock,
  Loader2,
  Brain,
  ArrowLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import { LanguageBadge } from '@/components/LanguageBadge';
import { ScoreBar, getScoreTextColor } from '@/components/ScoreBar';
import { useTranslation, getDateLocale } from '@/lib/i18n';
import type { MatchCandidate, LanguageLevel, Client } from '@/lib/types';

interface AIAnalysis {
  recommendation: string;
  reasoning: string;
  riskAssessment: string;
  alternativeStrategy: string;
}

interface MatchingData {
  candidates: MatchCandidate[];
  analysis_time_ms: number;
  total_analyzed: number;
  ai_analysis?: AIAnalysis | null;
}

function MatchingContentInner() {
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get('client') ?? '';
  const dateParam = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  const [data, setData] = useState<MatchingData | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState(clientIdParam);
  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const { t, locale } = useTranslation();
  const dateLocaleStr = getDateLocale(locale);

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((json) => {
      setAllClients(json.data);
      if (!selectedClientId && json.data.length > 0) {
        setSelectedClientId(json.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedClientId) return;

    async function load() {
      setLoading(true);
      setError(null);
      setValidated(null);
      try {
        const [matchRes, clientRes] = await Promise.all([
          fetch('/api/matching', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: selectedClientId, date: selectedDate }),
          }),
          fetch('/api/clients'),
        ]);

        if (!matchRes.ok) throw new Error('matching');

        const matchJson = await matchRes.json();
        setData(matchJson.data);

        if (clientRes.ok) {
          const clientsJson = await clientRes.json();
          const found = clientsJson.data.find((c: Client) => c.id === selectedClientId);
          setClient(found ?? null);
        }
      } catch {
        setError(t('matching.error_loading'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedClientId, selectedDate, t]);

  const handleValidate = async (candidate: MatchCandidate) => {
    setValidating(true);
    try {
      const res = await fetch('/api/matching/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          absence_id: 'abs-001',
          employe_id: candidate.employe_id,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message ?? t('matching.error_validation'));
      }
      setValidated(candidate.employe_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('matching.error_validation_generic'));
    } finally {
      setValidating(false);
    }
  };

  const availableCandidates = data?.candidates.filter((c) => c.is_available) ?? [];
  const excludedCandidates = data?.candidates.filter((c) => !c.is_available) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Back */}
      <Link href="/planning" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('matching.back')}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
          <Brain className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('matching.title')}</h1>
          <p className="text-sm text-gray-500">
            {t('matching.subtitle')}
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {client && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {t('matching.absence_signalee')} - {client.nom}
            </p>
            <p className="text-xs text-red-600">
              {t('matching.date')} : {new Date(selectedDate).toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Selectors */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="client-select" className="text-xs font-medium text-gray-500 mb-1 block">{t('matching.client')}</label>
            <select
              id="client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
            >
              {allClients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date-select" className="text-xs font-medium text-gray-500 mb-1 block">{t('matching.date')}</label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-sm text-gray-500">{t('matching.analyse_en_cours')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* AI Analysis Panel */}
      {data?.ai_analysis && !loading && (
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-primary-600" />
            <h2 className="text-sm font-bold text-primary-900 uppercase tracking-wide">{t('matching.ai_insight')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-primary-700 mb-1">{t('matching.ai_recommendation')}</p>
              <p className="text-sm text-gray-800">{data.ai_analysis.recommendation}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-700 mb-1">{t('matching.ai_reasoning')}</p>
              <p className="text-sm text-gray-800">{data.ai_analysis.reasoning}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-600 mb-1">{t('matching.ai_risk')}</p>
              <p className="text-sm text-gray-800">{data.ai_analysis.riskAssessment}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-600 mb-1">{t('matching.ai_alternative')}</p>
              <p className="text-sm text-gray-800">{data.ai_analysis.alternativeStrategy}</p>
            </div>
          </div>
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Requirements */}
          {client && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                {t('matching.exigences')}
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">{t('matching.langues_requises')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.langues_requises.map((l) => (
                      <LanguageBadge key={l.language} language={l.language} level={l.minimum_level as LanguageLevel} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">{t('matching.competences')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.competences_requises.map((c) => (
                      <span key={c} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-700">
                        {c.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">{t('matching.horaires')}</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {client.horaire_debut} - {client.horaire_fin}
                  </div>
                </div>

                {client.certifications_requises.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">{t('matching.certifications')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {client.certifications_requises.map((c) => (
                        <span key={c} className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right: Candidates */}
          <div className={clsx(client ? 'lg:col-span-2' : 'lg:col-span-3')}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                {t('matching.suggestions')} ({availableCandidates.length} {t('matching.disponibles')})
              </h2>

              <div className="space-y-3">
                {availableCandidates.map((candidate, idx) => (
                  <div
                    key={candidate.employe_id}
                    className={clsx(
                      'rounded-xl border p-4 transition-all',
                      validated === candidate.employe_id
                        ? 'border-emerald-300 bg-emerald-50'
                        : idx === 0
                        ? 'border-primary-200 bg-primary-50/30 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {candidate.employe_prenom} {candidate.employe_nom}
                          </span>
                          {idx === 0 && !validated && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <Check className="h-3 w-3" /> {t('matching.recommande')}
                            </span>
                          )}
                          {validated === candidate.employe_id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                              <Check className="h-3 w-3" /> {t('matching.valide')}
                            </span>
                          )}
                          {candidate.is_standby && (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                              Stand-by
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {candidate.raisons.slice(0, 4).map((r, i) => (
                            <span key={i} className="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                              {r}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-[10px] text-gray-400 mb-2">
                          <span>Langues: {candidate.score_langues.toFixed(1)}</span>
                          <span>Comp: {candidate.score_competences.toFixed(1)}</span>
                          <span>Dispo: {candidate.score_disponibilite.toFixed(1)}</span>
                          <span>Exp: {candidate.score_experience.toFixed(1)}</span>
                          <span>SB: {candidate.score_standby.toFixed(1)}</span>
                        </div>
                        <div className="w-full max-w-xs">
                          <ScoreBar score={candidate.score_total} size="sm" />
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={clsx('text-3xl font-bold tabular-nums', getScoreTextColor(candidate.score_total))}>
                          {candidate.score_total.toFixed(1)}%
                        </span>
                        {!validated && (
                          <button
                            onClick={() => handleValidate(candidate)}
                            disabled={validating}
                            className={clsx(
                              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                              idx === 0
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                            )}
                          >
                            {validating ? t('matching.validation') : `${t('matching.valider')} ${candidate.employe_prenom}`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {availableCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {t('matching.no_candidates')}
                  </div>
                )}
              </div>

              {/* Excluded candidates */}
              {excludedCandidates.length > 0 && (
                <details className="mt-6">
                  <summary className="text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-600">
                    {t('matching.exclus')} ({excludedCandidates.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {excludedCandidates.map((c) => (
                      <div key={c.employe_id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {c.employe_prenom} {c.employe_nom}
                          </span>
                          <span className="text-xs text-gray-400">{t('matching.exclu')}</span>
                        </div>
                        {c.exclusion_raisons && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.exclusion_raisons.map((r, i) => (
                              <span key={i} className="text-[10px] text-red-500 bg-red-50 rounded px-1 py-0.5">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 text-xs text-gray-400 text-center">
              {t('matching.ia_analyse')} {data.total_analyzed} {t('matching.profils_en')} {data.analysis_time_ms}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    }>
      <MatchingContentInner />
    </Suspense>
  );
}
