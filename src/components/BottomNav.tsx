'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  onAdd: () => void;
}

export function BottomNav({ onAdd }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-folk-charcoal border-t border-folk-stone/15 pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        <Link
          href="/pipeline"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            pathname === '/pipeline' ? 'text-folk-cream' : 'text-folk-stone'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v4H3z"/>
            <path d="M3 10h18v4H3z"/>
            <path d="M3 17h18v4H3z"/>
          </svg>
          <span className="text-[10px] font-medium">Pipeline</span>
        </Link>

        <button
          onClick={onAdd}
          className="w-14 h-14 rounded-full bg-folk-cream text-folk-ink flex items-center justify-center shadow-lg active:scale-95 transition-transform -mt-5"
          aria-label="Add opportunity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        <Link
          href="/companies"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            pathname === '/companies' ? 'text-folk-cream' : 'text-folk-stone'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-[10px] font-medium">Companies</span>
        </Link>
      </div>
    </nav>
  );
}
