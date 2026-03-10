'use client';

import { Settings, Bell, Shield, Database, Globe } from 'lucide-react';
import { useTranslation, type Locale } from '@/lib/i18n';

export default function ParametresPage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-6 w-6 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('parametres.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('parametres.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">{t('parametres.notifications')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('parametres.email_alerts')}</p>
                <p className="text-xs text-gray-500">{t('parametres.email_alerts_desc')}</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('parametres.push')}</p>
                <p className="text-xs text-gray-500">{t('parametres.push_desc')}</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('parametres.resume')}</p>
                <p className="text-xs text-gray-500">{t('parametres.resume_desc')}</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* IA Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">{t('parametres.moteur_ia')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">
                {t('parametres.seuil')}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t('parametres.seuil_desc')}
              </p>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full max-w-xs"
              />
              <span className="text-sm text-gray-600 ml-2">50%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('parametres.auto_fill')}</p>
                <p className="text-xs text-gray-500">
                  {t('parametres.auto_fill_desc')}
                </p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">{t('parametres.donnees')}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('parametres.exporter')}</p>
                <p className="text-xs text-gray-500">{t('parametres.exporter_desc')}</p>
              </div>
              <button className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition-colors">
                {t('parametres.exporter_btn')}
              </button>
            </div>
          </div>
        </div>

        {/* Langue */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">{t('parametres.langue')}</h2>
          </div>
          <select
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            <option value="fr">Francais</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
}
