'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, AlertTriangle, Check, Clock, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { LanguageBadge } from '@/components/LanguageBadge';
import { ScoreBar, getScoreTextColor } from '@/components/ScoreBar';
import { useTranslation, getDateLocale } from '@/lib/i18n';
import type { MatchCandidate, Client, LanguageLevel } from '@/lib/types';

interface MatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  date: string;
  absentEmployeeName: string;
  absentEmployeeId?: string;
}

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

export function MatchingModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  date,
  absentEmployeeName,
  absentEmployeeId,
}: MatchingModalProps) {
  const [data, setData] = useState<MatchingData | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();
  const dateLocaleStr = getDateLocale(locale);

  const fetchMatching = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [matchRes, clientRes] = await Promise.all([
        fetch('/api/matching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: clientId, date }),
        }),
        fetch('/api/clients'),
      ]);

      if (!matchRes.ok) throw new Error('matching');
      const matchJson = await matchRes.json();
      setData(matchJson.data);

      if (clientRes.ok) {
        const clientsJson = await clientRes.json();
        const found = clientsJson.data?.find((c: Client) => c.id === clientId);
        setClient(found ?? null);
      }
    } catch {
      setError(t('matching.error_loading'));
    } finally {
      setLoading(false);
    }
  }, [clientId, date, t]);

  useEffect(() => {
    if (isOpen && clientId) {
      fetchMatching();
      setValidated(null);
    }
  }, [isOpen, fetchMatching, clientId]);

  const handleValidate = async (candidate: MatchCandidate) => {
    setValidating(true);
    try {
      // First, find or create an absence record for this client+date
      let absenceId: string | null = null;

      // Try to find an existing open absence
      const searchRes = await fetch(`/api/absences?date=${date}&status=ouverte`);
      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        const existing = searchJson.data?.find(
          (a: { client_id: string }) => a.client_id === clientId
        );
        if (existing) absenceId = existing.id;
      }

      // If no existing absence found and we have the absent employee ID, create one
      if (!absenceId && absentEmployeeId) {
        const absRes = await fetch('/api/absences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employe_id: absentEmployeeId,
            client_id: clientId,
            date,
            type: 'imprevue',
            channel: 'telephone',
            statut: 'ouverte',
          }),
        });
        if (absRes.ok) {
          const absJson = await absRes.json();
          absenceId = absJson.data.id;
        }
      }

      if (!absenceId) {
        throw new Error(t('matching.error_validation'));
      }

      const res = await fetch('/api/matching/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          absence_id: absenceId,
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

  if (!isOpen) return null;

  const availableCandidates = data?.candidates.filter((c) => c.is_available) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('matching.absence_signalee')} - {absentEmployeeName}
              </h2>
              <p className="text-sm text-gray-600">
                {clientName} - {new Date(date).toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={t('matching.fermer')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-sm text-gray-500">{t('matching.analyse_en_cours')}</p>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Left: Exigences */}
              {client && (
                <div className="lg:col-span-1 border-r border-gray-200 p-6 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    {t('matching.exigences')}
                  </h3>
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

              {/* Right: Candidates + AI */}
              <div className={clsx(client ? 'lg:col-span-2' : 'lg:col-span-3', 'p-6')}>
                {/* AI Analysis */}
                {data.ai_analysis && (
                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-primary-600" />
                      <span className="text-xs font-bold text-primary-900 uppercase tracking-wide">{t('matching.ai_insight')}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{data.ai_analysis.recommendation}</p>
                    <p className="text-xs text-gray-600">{data.ai_analysis.reasoning}</p>
                  </div>
                )}
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  {t('matching.suggestions')} ({availableCandidates.length} {t('matching.disponibles')})
                </h3>
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
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {candidate.is_standby ? t('matching.standby_client') : t('matching.disponible')}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {candidate.raisons.slice(0, 3).map((r, i) => (
                              <span key={i} className="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                                {r}
                              </span>
                            ))}
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
                              {validating ? '...' : `${t('matching.valider')} ${candidate.employe_prenom}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {availableCandidates.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      {t('matching.no_candidates_short')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {data && !loading && (
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('matching.ia_analyse')} {data.total_analyzed} {t('matching.profils_en')} {data.analysis_time_ms}ms
            </p>
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {t('matching.fermer')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
