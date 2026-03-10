'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation, getDateLocale } from '@/lib/i18n';
import type { Employee } from '@/lib/types';

export default function FormationsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useTranslation();
  const dateLocaleStr = getDateLocale(locale);

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((json) => setEmployees(json.data))
      .finally(() => setLoading(false));
  }, []);

  const allFormations = employees.flatMap((emp) =>
    emp.formations.map((f) => ({
      ...f,
      employe_nom: `${emp.prenom} ${emp.nom}`,
      employe_id: emp.id,
    }))
  );

  const expiredFormations = allFormations.filter((f) => !f.is_valid);
  const validFormations = allFormations.filter((f) => f.is_valid);

  // Formations expiring within 90 days
  const soonExpiring = validFormations.filter((f) => {
    if (!f.date_expiry) return false;
    const expiry = new Date(f.date_expiry);
    const diff = expiry.getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-6 w-6 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('formations.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('formations.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">{t('formations.total')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{allFormations.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <p className="text-sm text-red-600">{t('formations.expirees')}</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{expiredFormations.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-5">
          <p className="text-sm text-orange-600">{t('formations.expirent_90')}</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{soonExpiring.length}</p>
        </div>
      </div>

      {/* Expired */}
      {expiredFormations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {t('formations.formations_expirees')}
          </h2>
          <div className="bg-white rounded-xl border border-red-200 divide-y divide-red-100">
            {expiredFormations.map((f, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.employe_nom}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 font-medium">
                    {t('formations.expiree_le')} {f.date_expiry ? new Date(f.date_expiry).toLocaleDateString(dateLocaleStr) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Soon expiring */}
      {soonExpiring.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-3">
            {t('formations.expirent_prochainement')}
          </h2>
          <div className="bg-white rounded-xl border border-orange-200 divide-y divide-orange-100">
            {soonExpiring.map((f, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.employe_nom}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-orange-600 font-medium">
                    {t('formations.expire_le')} {f.date_expiry ? new Date(f.date_expiry).toLocaleDateString(dateLocaleStr) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valid */}
      <div>
        <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {t('formations.formations_valides')} ({validFormations.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {validFormations.map((f, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{f.name}</p>
                <p className="text-xs text-gray-500">{f.employe_nom}</p>
              </div>
              <div className="text-right">
                {f.date_expiry && (
                  <p className="text-xs text-gray-400">
                    {t('formations.valide_jusquau')} {new Date(f.date_expiry).toLocaleDateString(dateLocaleStr)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
