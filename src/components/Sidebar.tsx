'use client';

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

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-[52px] bg-sidebar flex flex-col items-center">
      {/* Logo */}
      <div className="flex h-12 w-full items-center justify-center border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-sm">
          S
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-3 w-full px-1.5">
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
                'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                isActive
                  ? 'bg-primary-600/30 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              )}
              aria-label={t(item.labelKey)}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary-400" />
              )}
              <Icon className="h-[18px] w-[18px]" />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
