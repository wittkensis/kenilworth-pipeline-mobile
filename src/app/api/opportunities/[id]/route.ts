import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { company_id, position_title, job_posting_url, status, application_date, rejection_stage, contacts, notes } = body;

  const db = getDb();
  db.prepare(
    `UPDATE opportunities SET
      company_id = ?, position_title = ?, job_posting_url = ?, status = ?,
      application_date = ?, rejection_stage = ?, contacts = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    company_id, position_title, job_posting_url ?? null, status,
    application_date, rejection_stage ?? null, contacts ?? null, notes ?? null,
    Number(id)
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM opportunities WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
