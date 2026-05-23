'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Sheet } from './Sheet';
import { STATUS_OPTIONS } from '@/lib/types';
import type { OpportunityWithCompany, OpportunityStatus, Company } from '@/lib/types';

interface OpportunitySheetProps {
  open: boolean;
  opportunity: OpportunityWithCompany | null;
  preselectedCompanyId?: number;
  onClose: () => void;
  onSaved: () => void;
}

const input = 'w-full px-4 py-3.5 rounded-xl bg-folk-ink border border-folk-stone/20 text-folk-cream placeholder-folk-stone/40 focus:outline-none focus:border-folk-stone/40';
const label = 'block text-xs font-medium text-folk-stone mb-1.5 uppercase tracking-wide';

export function OpportunitySheet({ open, opportunity, preselectedCompanyId, onClose, onSaved }: OpportunitySheetProps) {
  const isEditing = opportunity !== null;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [positionTitle, setPositionTitle] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [status, setStatus] = useState<OpportunityStatus>('Applied');
  const [applicationDate, setApplicationDate] = useState('');
  const [rejectionStage, setRejectionStage] = useState('');
  const [contacts, setContacts] = useState('');
  const [notes, setNotes] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);

  useEffect(() => {
    fetch('/api/companies')
      .then((r) => r.json())
      .then(setCompanies)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!open) return;

    if (opportunity) {
      setCompanyId(opportunity.company_id);
      setPositionTitle(opportunity.position_title);
      setJobPostingUrl(opportunity.job_posting_url ?? '');
      setStatus(opportunity.status);
      setApplicationDate(opportunity.application_date);
      setRejectionStage(opportunity.rejection_stage ?? '');
      setContacts(opportunity.contacts ?? '');
      setNotes(opportunity.notes ?? '');
      setShowExtra(!!(opportunity.notes || opportunity.contacts || opportunity.job_posting_url));
    } else {
      setCompanyId(preselectedCompanyId ?? '');
      setPositionTitle('');
      setJobPostingUrl('');
      setStatus('Applied');
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setRejectionStage('');
      setContacts('');
      setNotes('');
      setShowExtra(false);
    }

    setShowDeleteConfirm(false);
    setCompanySearch('');
    setShowCompanyPicker(false);
  }, [open, opportunity, preselectedCompanyId]);

  const selectedCompany = companies.find((c) => c.id === companyId);
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!companyId || !positionTitle || !applicationDate) return;

    setSaving(true);
    try {
      const body = {
        company_id: companyId,
        position_title: positionTitle,
        job_posting_url: jobPostingUrl || null,
        status,
        application_date: applicationDate,
        rejection_stage: rejectionStage || null,
        contacts: contacts || null,
        notes: notes || null,
      };

      const url = isEditing ? `/api/opportunities/${opportunity!.id}` : '/api/opportunities';
      const method = isEditing ? 'PUT' : 'POST';

      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!opportunity) return;
    await fetch(`/api/opportunities/${opportunity.id}`, { method: 'DELETE' });
    onSaved();
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit Opportunity' : 'Add Opportunity'}>
      <form onSubmit={handleSubmit}>
        <div className="px-5 pt-5 pb-4 flex flex-col gap-5">

          {/* Company picker */}
          <div>
            <label className={label}>Company</label>
            {showCompanyPicker ? (
              <div className="bg-folk-ink rounded-xl border border-folk-stone/20 overflow-hidden">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Search companies..."
                  autoFocus
                  className="w-full px-4 py-3.5 bg-transparent text-folk-cream placeholder-folk-stone/40 focus:outline-none border-b border-folk-stone/15"
                />
                <div className="max-h-52 overflow-y-auto">
                  {filteredCompanies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setCompanyId(c.id); setShowCompanyPicker(false); setCompanySearch(''); }}
                      className={`w-full text-left px-4 py-3 text-sm border-b border-folk-stone/10 last:border-0 transition-colors ${
                        c.id === companyId ? 'text-folk-cream bg-folk-stone/10' : 'text-folk-stone active:bg-folk-stone/10'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <p className="px-4 py-3 text-sm text-folk-stone/50">No matches</p>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCompanyPicker(true)}
                className={`${input} text-left flex items-center justify-between`}
              >
                <span className={selectedCompany ? 'text-folk-cream' : 'text-folk-stone/40'}>
                  {selectedCompany?.name ?? 'Select company...'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-folk-stone shrink-0">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            )}
          </div>

          {/* Role title */}
          <div>
            <label className={label}>Role</label>
            <input
              type="text"
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              placeholder="e.g. Staff Product Designer"
              required
              className={input}
            />
          </div>

          {/* Status chips */}
          <div>
            <label className={label}>Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className="px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: active ? `${opt.color}20` : 'transparent',
                      color: active ? opt.color : '#8B7E6A',
                      border: `1px solid ${active ? `${opt.color}50` : 'rgba(139,126,106,0.2)'}`,
                    }}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rejection stage — shown when Rejected */}
          {status === 'Rejected' && (
            <div>
              <label className={label}>Rejection Stage</label>
              <input
                type="text"
                value={rejectionStage}
                onChange={(e) => setRejectionStage(e.target.value)}
                placeholder="e.g. After phone screen"
                className={input}
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className={label}>Date</label>
            <input
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              required
              className={input}
            />
          </div>

          {/* Extra fields toggle */}
          {!showExtra ? (
            <button
              type="button"
              onClick={() => setShowExtra(true)}
              className="text-sm text-folk-stone active:text-folk-cream flex items-center gap-2 self-start"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add URL, notes, contacts
            </button>
          ) : (
            <>
              <div>
                <label className={label}>Job Posting URL</label>
                <input type="url" value={jobPostingUrl} onChange={(e) => setJobPostingUrl(e.target.value)} placeholder="https://..." className={input} />
              </div>
              <div>
                <label className={label}>Notes</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="AI Focus, Remote..." className={input} />
              </div>
              <div>
                <label className={label}>Contacts</label>
                <input type="text" value={contacts} onChange={(e) => setContacts(e.target.value)} placeholder="Jane Smith" className={input} />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 pt-2 flex items-center justify-between border-t border-folk-stone/10 gap-3">
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-3 rounded-xl text-folk-stone active:text-red-400 active:bg-red-400/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-folk-stone">Delete?</span>
              <button type="button" onClick={handleDelete} className="px-3 py-2 rounded-lg text-red-400 border border-red-400/30 text-sm active:bg-red-400/10">Yes</button>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-3 py-2 rounded-lg text-folk-stone text-sm">No</button>
            </div>
          )}

          {!isEditing && <div />}

          <button
            type="submit"
            disabled={saving || !companyId || !positionTitle || !applicationDate}
            className="flex-1 py-4 rounded-xl bg-folk-cream text-folk-ink font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
