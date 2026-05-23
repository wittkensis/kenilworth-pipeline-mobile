import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { OpportunityWithCompany } from '@/lib/types';

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT o.*, c.name as company_name, c.excitement, c.general_location, c.description as company_description
       FROM opportunities o
       JOIN companies c ON o.company_id = c.id
       ORDER BY o.application_date DESC, o.id DESC`
    )
    .all() as OpportunityWithCompany[];
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, position_title, job_posting_url, status, application_date, rejection_stage, contacts, notes } = body;

  if (!company_id || !position_title || !status || !application_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO opportunities (company_id, position_title, job_posting_url, status, application_date, rejection_stage, contacts, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(company_id, position_title, job_posting_url ?? null, status, application_date, rejection_stage ?? null, contacts ?? null, notes ?? null);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
