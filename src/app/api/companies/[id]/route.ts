import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, excitement, general_location, description, size_band, domain, core_competencies, job_board_link } = body;

  const db = getDb();
  db.prepare(
    `UPDATE companies SET
      name = ?, excitement = ?, general_location = ?, description = ?,
      size_band = ?, domain = ?, core_competencies = ?, job_board_link = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(name, excitement, general_location ?? null, description ?? null, size_band ?? null, domain ?? null, core_competencies ?? null, job_board_link ?? null, Number(id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM companies WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
