'use client';

import { useState, useEffect, useCallback } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { CompanySheet } from '@/components/CompanySheet';
import { OpportunitySheet } from '@/components/OpportunitySheet';
import type { CompanyWithStats, ExcitementLevel } from '@/lib/types';
import { EXCITEMENT_OPTIONS } from '@/lib/types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [excitementFilter, setExcitementFilter] = useState<ExcitementLevel | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithStats | null>(null);
  const [oppSheetOpen, setOppSheetOpen] = useState(false);
  const [preselectedCompanyId, setPreselectedCompanyId] = useState<number | undefined>();

  const load = useCallback(async () => {
    const data = await fetch('/api/companies').then((r) => r.json());
    setCompanies(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEditCompany(c: CompanyWithStats) {
    setEditingCompany(c);
    setCompanySheetOpen(true);
  }

  function openAddCompany() {
    setEditingCompany(null);
    setCompanySheetOpen(true);
  }

  function openAddOpportunity(companyId: number) {
    setPreselectedCompanyId(companyId);
    setOppSheetOpen(true);
  }

  function handleCompanySaved() {
    setCompanySheetOpen(false);
    load();
  }

  function handleOppSaved() {
    setOppSheetOpen(false);
    load();
  }

  const filtered = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.general_location ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesExcitement = excitementFilter === 'All' || c.excitement === excitementFilter;
    return matchesSearch && matchesExcitement;
  });

  const excitementCounts = companies.reduce<Record<string, number>>((acc, c) => {
    acc[c.excitement] = (acc[c.excitement] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-dvh bg-folk-ink">
      {/* Header */}
      <div className="px-5 pt-safe-top pt-6 pb-4 shrink-0">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-folk-stone text-xs tracking-widest uppercase">Companies</h1>
          <button
            onClick={openAddCompany}
            className="text-folk-stone text-sm active:text-folk-cream transition-colors"
          >
            + Add
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-folk-stone/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-folk-charcoal border border-folk-stone/15 text-folk-cream placeholder-folk-stone/40 focus:outline-none focus:border-folk-stone/30"
          />
        </div>

        {/* Excitement filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          <button
            onClick={() => setExcitementFilter('All')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              excitementFilter === 'All'
                ? 'bg-folk-cream text-folk-ink'
                : 'bg-folk-charcoal text-folk-stone border border-folk-stone/20'
            }`}
          >
            All
          </button>
          {EXCITEMENT_OPTIONS.filter((e) => excitementCounts[e.value] > 0).map((opt) => {
            const active = excitementFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setExcitementFilter(opt.value)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? `${opt.color}20` : '#2D2A26',
                  color: active ? opt.color : '#8B7E6A',
                  border: `1px solid ${active ? `${opt.color}40` : 'rgba(139,126,106,0.2)'}`,
                }}
              >
                {opt.short} ({excitementCounts[opt.value]})
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

        <div className="flex flex-col gap-2 pt-1">
          {filtered.map((company) => {
            const excOpt = EXCITEMENT_OPTIONS.find((e) => e.value === company.excitement);
            return (
              <button
                key={company.id}
                onClick={() => openEditCompany(company)}
                className="w-full text-left rounded-2xl bg-folk-charcoal border border-folk-stone/10 px-4 py-4 active:opacity-70 transition-opacity"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-folk-cream font-medium text-sm truncate">{company.name}</p>
                    {company.general_location && (
                      <p className="text-folk-stone/60 text-xs mt-0.5">{company.general_location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {company.interviewing_count > 0 && (
                      <span className="text-green-400 text-xs font-medium px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20">
                        {company.interviewing_count} active
                      </span>
                    )}
                    {company.total_opportunities > 0 && company.interviewing_count === 0 && (
                      <span className="text-folk-stone/60 text-xs">{company.total_opportunities} logged</span>
                    )}
                    {excOpt && (
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: excOpt.color }} />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-folk-stone text-sm">No companies found</p>
          </div>
        )}
      </div>

      <BottomNav onAdd={() => { setEditingCompany(null); setPreselectedCompanyId(undefined); setOppSheetOpen(true); }} />

      <CompanySheet
        open={companySheetOpen}
        company={editingCompany}
        onClose={() => setCompanySheetOpen(false)}
        onSaved={handleCompanySaved}
        onAddOpportunity={openAddOpportunity}
      />

      <OpportunitySheet
        open={oppSheetOpen}
        opportunity={null}
        preselectedCompanyId={preselectedCompanyId}
        onClose={() => setOppSheetOpen(false)}
        onSaved={handleOppSaved}
      />
    </div>
  );
}
