'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { clsx } from 'clsx';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('samsic-sidebar');
    if (stored === 'collapsed') setExpanded(false);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setExpanded(detail.expanded);
    };
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  return (
    <main
      className={clsx(
        'mt-12 bg-surface min-h-[calc(100vh-48px)] main-transition',
        expanded ? 'ml-[220px]' : 'ml-[56px]'
      )}
    >
      {children}
    </main>
  );
}
