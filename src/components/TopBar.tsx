'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, LogOut, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation, type Locale } from '@/lib/i18n';

export function TopBar() {
  const { t, locale, setLocale } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((json) => {
        const unread = json.data?.filter((a: { is_read: boolean }) => !a.is_read).length ?? 0;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-[52px] right-0 z-30 h-12 bg-topbar border-b border-topbar-border flex items-center px-4 gap-4">
      {/* Logo / Brand */}
      <Link href="/" className="flex items-center gap-2 mr-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500 text-white font-bold text-xs">
          S
        </div>
        <span className="text-sm font-semibold text-white tracking-wide hidden sm:inline">
          SAMSIC
        </span>
        <span className="text-xs text-slate-400 hidden md:inline">
          Planning IA
        </span>
      </Link>

      {/* Global Search */}
      <div className="flex-1 max-w-md mx-auto">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="w-full flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm text-slate-300 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="flex-1 text-left text-xs">{t('common.search_placeholder')}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
            Cmd+K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        {/* Language Toggle */}
        <div className="flex items-center rounded-md overflow-hidden border border-white/15 mr-1">
          <button
            onClick={() => setLocale('fr')}
            className={clsx(
              'px-2 py-1 text-[10px] font-semibold transition-colors',
              locale === 'fr'
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
          >
            FR
          </button>
          <button
            onClick={() => setLocale('en')}
            className={clsx(
              'px-2 py-1 text-[10px] font-semibold transition-colors',
              locale === 'en'
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
          >
            EN
          </button>
        </div>

        {/* Notifications */}
        <Link
          href="/alertes"
          className="relative rounded-md p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/15">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-semibold">
            ML
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-white leading-tight">Marie Laurent</div>
            <div className="text-[10px] text-slate-400 leading-tight">{t('common.responsable_planning')}</div>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t('common.se_deconnecter')}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
