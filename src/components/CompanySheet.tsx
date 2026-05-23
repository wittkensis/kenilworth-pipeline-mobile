'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Sheet } from './Sheet';
import { EXCITEMENT_OPTIONS } from '@/lib/types';
import type { CompanyWithStats, ExcitementLevel } from '@/lib/types';

interface CompanySheetProps {
  open: boolean;
  company: CompanyWithStats | null;
  onClose: () => void;
  onSaved: () => void;
  onAddOpportunity?: (companyId: number) => void;
}

const input = 'w-full px-4 py-3.5 rounded-xl bg-folk-ink border border-folk-stone/20 text-folk-cream placeholder-folk-stone/40 focus:outline-none focus:border-folk-stone/40';
const label = 'block text-xs font-medium text-folk-stone mb-1.5 uppercase tracking-wide';

export function CompanySheet({ open, company, onClose, onSaved, onAddOpportunity }: CompanySheetProps) {
  const isEditing = company !== null;

  const [name, setName] = useState('');
  const [excitement, setExcitement] = useState<ExcitementLevel>('Not Sure Yet');
  const [generalLocation, setGeneralLocation] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [jobBoardLink, setJobBoardLink] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (company) {
      setName(company.name);
      setExcitement(company.excitement);
      setGeneralLocation(company.general_location ?? '');
      setDescription(company.description ?? '');
      setDomain(company.domain ?? '');
      setJobBoardLink(company.job_board_link ?? '');
      setShowExtra(!!(company.description || company.domain || company.job_board_link));
    } else {
      setName('');
      setExcitement('Not Sure Yet');
      setGeneralLocation('');
      setDescription('');
      setDomain('');
      setJobBoardLink('');
      setShowExtra(false);
    }
    setShowDeleteConfirm(false);
  }, [open, company]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const body = {
        name,
        excitement,
        general_location: generalLocation || null,
        description: description || null,
        domain: domain || null,
        job_board_link: jobBoardLink || null,
      };

      const url = isEditing ? `/api/companies/${company!.id}` : '/api/companies';
      const method = isEditing ? 'PUT' : 'POST';

      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!company) return;
    await fetch(`/api/companies/${company.id}`, { method: 'DELETE' });
    onSaved();
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit Company' : 'Add Company'}>
      <form onSubmit={handleSubmit}>
        <div className="px-5 pt-5 pb-4 flex flex-col gap-5">

          {/* Stats summary when editing */}
          {isEditing && company && (company.total_opportunities > 0) && (
            <div className="flex gap-3">
              {company.interviewing_count > 0 && (
                <div className="flex-1 rounded-xl bg-green-400/10 border border-green-400/20 px-3 py-2.5 text-center">
                  <div className="text-green-400 font-semibold text-lg">{company.interviewing_count}</div>
                  <div className="text-green-400/70 text-[10px] uppercase tracking-wide">Interviewing</div>
                </div>
              )}
              {company.applied_count > 0 && (
                <div className="flex-1 rounded-xl bg-blue-400/10 border border-blue-400/20 px-3 py-2.5 text-center">
                  <div className="text-blue-400 font-semibold text-lg">{company.applied_count}</div>
                  <div className="text-blue-400/70 text-[10px] uppercase tracking-wide">Applied</div>
                </div>
              )}
              <div className="flex-1 rounded-xl bg-folk-stone/10 border border-folk-stone/20 px-3 py-2.5 text-center">
                <div className="text-folk-cream font-semibold text-lg">{company.total_opportunities}</div>
                <div className="text-folk-stone text-[10px] uppercase tracking-wide">Total</div>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className={label}>Company Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" required className={input} />
          </div>

          {/* Excitement */}
          <div>
            <label className={label}>Excitement</label>
            <div className="flex flex-wrap gap-2">
              {EXCITEMENT_OPTIONS.map((opt) => {
                const active = excitement === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExcitement(opt.value)}
                    className="px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: active ? `${opt.color}20` : 'transparent',
                      color: active ? opt.color : '#8B7E6A',
                      border: `1px solid ${active ? `${opt.color}50` : 'rgba(139,126,106,0.2)'}`,
                    }}
                  >
                    {opt.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={label}>Location</label>
            <input type="text" value={generalLocation} onChange={(e) => setGeneralLocation(e.target.value)} placeholder="SF Bay Area, Remote..." className={input} />
          </div>

          {/* Extra fields */}
          {!showExtra ? (
            <button type="button" onClick={() => setShowExtra(true)} className="text-sm text-folk-stone active:text-folk-cream flex items-center gap-2 self-start">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add description, domain, job board
            </button>
          ) : (
            <>
              <div>
                <label className={label}>Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What they do..." className={input} />
              </div>
              <div>
                <label className={label}>Domain</label>
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.com" className={input} />
              </div>
              <div>
                <label className={label}>Job Board URL</label>
                <input type="url" value={jobBoardLink} onChange={(e) => setJobBoardLink(e.target.value)} placeholder="https://..." className={input} />
              </div>
            </>
          )}

          {/* Add opportunity shortcut when editing */}
          {isEditing && onAddOpportunity && (
            <button
              type="button"
              onClick={() => { onClose(); onAddOpportunity(company!.id); }}
              className="w-full py-3.5 rounded-xl border border-folk-stone/25 text-folk-stone text-sm active:bg-folk-stone/10 transition-colors"
            >
              + Log opportunity at {company?.name}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 pt-2 flex items-center justify-between border-t border-folk-stone/10 gap-3">
          {isEditing && !showDeleteConfirm && (
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-xl text-folk-stone active:text-red-400 active:bg-red-400/10 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-folk-stone">Delete company + all its opportunities?</span>
              <button type="button" onClick={handleDelete} className="px-3 py-2 rounded-lg text-red-400 border border-red-400/30 text-sm active:bg-red-400/10">Yes</button>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-3 py-2 rounded-lg text-folk-stone text-sm">No</button>
            </div>
          )}

          {!isEditing && <div />}

          <button
            type="submit"
            disabled={saving || !name}
            className="flex-1 py-4 rounded-xl bg-folk-cream text-folk-ink font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
