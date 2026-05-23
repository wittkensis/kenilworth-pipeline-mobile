'use client';

import { useState, useEffect, useCallback } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { StatusBadge } from '@/components/StatusBadge';
import { OpportunitySheet } from '@/components/OpportunitySheet';
import type { OpportunityWithCompany, OpportunityStatus, DashboardStats } from '@/lib/types';
import { STATUS_OPTIONS } from '@/lib/types';

const ALL = 'All' as const;
type Filter = OpportunityStatus | typeof ALL;

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<OpportunityWithCompany[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filter, setFilter] = useState<Filter>(ALL);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<OpportunityWithCompany | null>(null);
  const [preselectedCompanyId, setPreselectedCompanyId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [opps, statsData] = await Promise.all([
      fetch('/api/opportunities').then((r) => r.json()),
      fetch('/api/stats').then((r) => r.json()),
    ]);
    setOpportunities(opps);
    setStats(statsData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd(companyId?: number) {
    setEditing(null);
    setPreselectedCompanyId(companyId);
    setSheetOpen(true);
  }

  function openEdit(opp: OpportunityWithCompany) {
    setEditing(opp);
    setPreselectedCompanyId(undefined);
    setSheetOpen(true);
  }

  function handleSaved() {
    setSheetOpen(false);
    load();
  }

  const filtered = filter === ALL ? opportunities : opportunities.filter((o) => o.status === filter);

  // Status counts for filter chips
  const counts = opportunities.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-dvh bg-folk-ink">
      {/* Header with stats */}
      <div className="px-5 pt-safe-top pt-6 pb-4 shrink-0">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-folk-stone text-xs tracking-widest uppercase">Pipeline</h1>
          {stats && (
            <div className="flex gap-4 text-right">
              {stats.actively_interviewing > 0 && (
                <div>
                  <span className="text-green-400 font-semibold">{stats.actively_interviewing}</span>
                  <span className="text-folk-stone/60 text-xs ml-1">active</span>
                </div>
              )}
              <div>
                <span className="text-folk-cream font-semibold">{stats.total_opportunities}</span>
                <span className="text-folk-stone/60 text-xs ml-1">total</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter chips — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          <button
            onClick={() => setFilter(ALL)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === ALL
                ? 'bg-folk-cream text-folk-ink'
                : 'bg-folk-charcoal text-folk-stone border border-folk-stone/20'
            }`}
          >
            All {opportunities.length > 0 && `(${opportunities.length})`}
          </button>
          {STATUS_OPTIONS.filter((s) => counts[s.value] > 0).map((s) => {
            const active = filter === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? `${s.color}20` : '#2D2A26',
                  color: active ? s.color : '#8B7E6A',
                  border: `1px solid ${active ? `${s.color}40` : 'rgba(139,126,106,0.2)'}`,
                }}
              >
                {s.value} ({counts[s.value]})
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {loading && (
          <div className="flex items-center justify-center h-40 text-folk-stone text-sm">Loading...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-folk-stone text-sm">Nothing here</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-1">
          {filtered.map((opp) => (
            <button
              key={opp.id}
              onClick={() => openEdit(opp)}
              className="w-full text-left rounded-2xl bg-folk-charcoal border border-folk-stone/10 px-4 py-4 active:opacity-70 transition-opacity"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-folk-cream font-medium text-sm truncate">{opp.company_name}</p>
                  <p className="text-folk-stone text-sm mt-0.5 truncate">{opp.position_title}</p>
                </div>
                <StatusBadge status={opp.status} />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-folk-stone/50 text-xs">{opp.application_date}</span>
                {opp.general_location && (
                  <span className="text-folk-stone/40 text-xs">{opp.general_location}</span>
                )}
                {opp.rejection_stage && (
                  <span className="text-folk-stone/50 text-xs italic">{opp.rejection_stage}</span>
                )}
              </div>
              {opp.notes && (
                <p className="text-folk-stone/50 text-xs mt-2 truncate">{opp.notes}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <BottomNav onAdd={() => openAdd()} />

      <OpportunitySheet
        open={sheetOpen}
        opportunity={editing}
        preselectedCompanyId={preselectedCompanyId}
        onClose={() => setSheetOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
