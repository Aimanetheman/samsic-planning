'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Brain,
  Bell,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from '@/lib/i18n';

const navItems = [
  { href: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/personnel', labelKey: 'nav.personnel', icon: Users },
  { href: '/clients', labelKey: 'nav.clients', icon: Building2 },
  { href: '/planning', labelKey: 'nav.planning', icon: Calendar },
  { href: '/matching', labelKey: 'nav.matching', icon: Brain },
  { href: '/alertes', labelKey: 'nav.alertes', icon: Bell },
  { href: '/formations', labelKey: 'nav.formations', icon: GraduationCap },
  { href: '/parametres', labelKey: 'nav.parametres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('samsic-sidebar');
    if (stored === 'collapsed') setExpanded(false);
  }, []);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem('samsic-sidebar', next ? 'expanded' : 'collapsed');
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { expanded: next } }));
  };

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 z-40 h-screen bg-sidebar flex flex-col sidebar-transition',
        expanded ? 'w-[220px]' : 'w-[56px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-12 items-center border-b border-white/10 px-3 gap-2.5 overflow-hidden">
        <img
          src="https://cdn.brandfetch.io/idCK2z6PIN/w/150/h/150/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1766940475128"
          alt="Samsic"
          className="h-7 w-7 flex-shrink-0 rounded"
        />
        {expanded && (
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm tracking-wide leading-tight">SAMSIC</div>
            <div className="text-slate-400 text-[10px] leading-tight">Facility Luxembourg</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group relative flex items-center rounded-lg transition-all',
                expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5',
                isActive
                  ? 'bg-primary-600/25 text-white'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary-400" />
              )}
              <Icon className={clsx('flex-shrink-0', expanded ? 'h-[18px] w-[18px]' : 'h-5 w-5')} />
              {expanded && (
                <span className="text-sm font-medium truncate">{t(item.labelKey)}</span>
              )}
              {/* Tooltip when collapsed */}
              {!expanded && (
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                  {t(item.labelKey)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/10 px-2 py-2">
        <button
          onClick={toggle}
          className={clsx(
            'flex items-center rounded-lg py-2 text-slate-400 hover:text-white hover:bg-white/8 transition-all w-full',
            expanded ? 'gap-3 px-3' : 'justify-center'
          )}
        >
          {expanded ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs font-medium">{t('nav.collapse')}</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
