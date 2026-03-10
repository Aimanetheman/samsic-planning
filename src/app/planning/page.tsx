'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PlanningCell } from '@/components/PlanningCell';
import { MatchingModal } from '@/components/MatchingModal';
import { useTranslation, getDateLocale } from '@/lib/i18n';
import type { Employee, Client, Affectation, DayStatus } from '@/lib/types';

interface PlanningDayData {
  date: string;
  day_name: string;
  affectation: Affectation | null;
  employee: Employee | null;
  status: DayStatus;
}

interface PlanningRowData {
  client: Client;
  days: PlanningDayData[];
}

interface PlanningResponse {
  week_start: string;
  week_end: string;
  planning: PlanningRowData[];
}

interface ModalState {
  isOpen: boolean;
  clientId: string;
  clientName: string;
  date: string;
  absentEmployeeName: string;
  absentEmployeeId: string;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function statusToCellType(status: DayStatus): 'titulaire' | 'formation' | 'stand_by' | 'remplacement' | 'absent' | null {
  if (status === 'non_couvert') return null;
  return status;
}

export default function PlanningPage() {
  const [data, setData] = useState<PlanningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    clientId: '',
    clientName: '',
    date: '',
    absentEmployeeName: '',
    absentEmployeeId: '',
  });
  const { t, locale } = useTranslation();
  const dateLocaleStr = getDateLocale(locale);

  const dayLabels: Record<string, string> = {
    lundi: t('planning.lundi'),
    mardi: t('planning.mardi'),
    mercredi: t('planning.mercredi'),
    jeudi: t('planning.jeudi'),
    vendredi: t('planning.vendredi'),
  };

  const weekParam = currentMonday.toISOString().split('T')[0];

  const formatWeekRange = (start: string, end: string): string => {
    const s = new Date(start);
    const e = new Date(end);
    const startStr = s.toLocaleDateString(dateLocaleStr, { day: 'numeric', month: 'short' });
    const endStr = e.toLocaleDateString(dateLocaleStr, { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/planning?week=${weekParam}`);
      if (!res.ok) throw new Error('API');
      const json = await res.json();
      setData(json.data);
    } catch {
      setError(t('planning.error'));
    } finally {
      setLoading(false);
    }
  }, [weekParam, t]);

  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]);

  const goToPrevWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToToday = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  const openMatchingModal = (
    clientId: string,
    clientName: string,
    date: string,
    absentName: string,
    absentId: string
  ) => {
    setModal({
      isOpen: true,
      clientId,
      clientName,
      date,
      absentEmployeeName: absentName,
      absentEmployeeId: absentId,
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('planning.title')}</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">
              {t('planning.semaine_du')} {formatWeekRange(data.week_start, data.week_end)}
            </p>
          )}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
          onClick={fetchPlanning}
        >
          <Sparkles className="h-4 w-4" />
          {t('planning.auto_remplir')}
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-6">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={goToPrevWeek}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('planning.sem_prec')}
          </button>
          <button
            onClick={goToToday}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            {t('planning.aujourdhui')}
          </button>
          <button
            onClick={goToNextWeek}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('planning.sem_suiv')}
            <ChevronRight className="h-4 w-4" />
          </button>
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

      {/* Planning Matrix */}
      {data && !loading && !error && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[200px] bg-gray-50 sticky left-0 z-10">
                    {t('planning.client')}
                  </th>
                  {data.planning[0]?.days.map((day) => (
                    <th
                      key={day.date}
                      className="text-center px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50"
                    >
                      <div>{dayLabels[day.day_name] ?? day.day_name}</div>
                      <div className="text-[10px] font-normal text-gray-400 mt-0.5">
                        {new Date(day.date).toLocaleDateString(dateLocaleStr, { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.planning.map((row) => (
                  <tr key={row.client.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-gray-100">
                      <div className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                        {row.client.nom}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {row.client.horaire_debut} - {row.client.horaire_fin}
                      </div>
                    </td>
                    {row.days.map((day) => {
                      const cellType = statusToCellType(day.status);
                      const employeeName = day.employee
                        ? `${day.employee.prenom[0]}. ${day.employee.nom}`
                        : null;
                      const isAbsent = day.status === 'absent' || day.status === 'non_couvert';
                      const absentName = day.employee
                        ? `${day.employee.prenom} ${day.employee.nom}`
                        : 'Inconnu';
                      const absentId = day.employee?.id ?? '';

                      return (
                        <td key={day.date} className="px-2 py-2">
                          <PlanningCell
                            employeeName={isAbsent && day.status === 'non_couvert' ? null : employeeName}
                            type={isAbsent && day.status === 'non_couvert' ? null : cellType}
                            hasAbsence={isAbsent}
                            onClickAbsence={() =>
                              openMatchingModal(
                                row.client.id,
                                row.client.nom,
                                day.date,
                                absentName,
                                absentId
                              )
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{t('planning.legende')}</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-200 border border-blue-300" />
              {t('planning.titulaire')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-200 border border-emerald-300" />
              {t('planning.en_formation')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-yellow-200 border border-yellow-300" />
              {t('planning.stand_by')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-purple-200 border border-purple-300" />
              {t('planning.remplacement')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-200 border border-red-300" />
              {t('planning.absent')}
            </div>
          </div>
        </>
      )}

      {/* Matching Modal */}
      <MatchingModal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        clientId={modal.clientId}
        clientName={modal.clientName}
        date={modal.date}
        absentEmployeeName={modal.absentEmployeeName}
        absentEmployeeId={modal.absentEmployeeId}
      />
    </div>
  );
}
