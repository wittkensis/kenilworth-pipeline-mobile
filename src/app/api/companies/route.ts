import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { CompanyWithStats } from '@/lib/types';

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.*,
        COUNT(o.id) as total_opportunities,
        SUM(CASE WHEN o.status = 'Interviewing' THEN 1 ELSE 0 END) as interviewing_count,
        SUM(CASE WHEN o.status = 'Applied' THEN 1 ELSE 0 END) as applied_count,
        SUM(CASE WHEN o.status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count
       FROM companies c
       LEFT JOIN opportunities o ON c.id = o.company_id
       GROUP BY c.id
       ORDER BY
         CASE excitement
           WHEN 'Dream Job' THEN 1
           WHEN 'Highly Considering' THEN 2
           WHEN 'Intriguing' THEN 3
           WHEN 'Not Sure Yet' THEN 4
           WHEN 'Never' THEN 5
         END,
         c.name ASC`
    )
    .all() as CompanyWithStats[];
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, excitement, general_location, description, size_band, domain, core_competencies, job_board_link } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO companies (name, excitement, general_location, description, size_band, domain, core_competencies, job_board_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, excitement ?? 'Not Sure Yet', general_location ?? null, description ?? null, size_band ?? null, domain ?? null, core_competencies ?? null, job_board_link ?? null);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
