'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation, type Locale } from '@/lib/i18n';

export function TopBar() {
  const { t, locale, setLocale } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((json) => {
        const unread = json.data?.filter((a: { is_read: boolean }) => !a.is_read).length ?? 0;
        setUnreadCount(unread);
      })
      .catch(() => {});

    const stored = localStorage.getItem('samsic-sidebar');
    if (stored === 'collapsed') setSidebarExpanded(false);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSidebarExpanded(detail.expanded);
    };
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 z-30 h-12 bg-topbar border-b border-topbar-border flex items-center px-4 gap-3 main-transition',
        sidebarExpanded ? 'left-[220px]' : 'left-[56px]'
      )}
    >
      {/* Global Search */}
      <div className="flex-1 max-w-lg">
        <div className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm text-slate-300 transition-colors cursor-pointer">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="flex-1 text-xs text-slate-400">{t('common.search_placeholder')}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
            Cmd+K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        {/* Language Toggle */}
        <div className="flex items-center rounded-md overflow-hidden border border-white/15 mr-1">
          <button
            onClick={() => setLocale('fr')}
            className={clsx(
              'px-2 py-1 text-[10px] font-bold transition-colors',
              locale === 'fr'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
          >
            FR
          </button>
          <button
            onClick={() => setLocale('en')}
            className={clsx(
              'px-2 py-1 text-[10px] font-bold transition-colors',
              locale === 'en'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
          >
            EN
          </button>
        </div>

        {/* Notifications */}
        <Link
          href="/alertes"
          className="relative rounded-lg p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User */}
        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/15">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-400 text-white text-[10px] font-bold">
            ML
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-white leading-tight">Marie Laurent</div>
            <div className="text-[10px] text-slate-400 leading-tight">{t('common.responsable_planning')}</div>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t('common.se_deconnecter')}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
