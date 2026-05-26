import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.FOCUS_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const interviewing = db.prepare(`
    SELECT
      c.name as company_name,
      c.excitement,
      c.domain,
      o.position_title,
      o.status,
      o.application_date
    FROM opportunities o
    JOIN companies c ON o.company_id = c.id
    WHERE o.status = 'Interviewing'
    ORDER BY o.application_date DESC
  `).all();

  const radar = db.prepare(`
    SELECT
      c.name as company_name,
      c.excitement,
      c.domain,
      c.job_board_link,
      c.description
    FROM companies c
    WHERE c.excitement IN ('Dream Job', 'Highly Considering')
      AND c.id NOT IN (
        SELECT DISTINCT company_id FROM opportunities
        WHERE status = 'Interviewing'
      )
    ORDER BY
      CASE c.excitement WHEN 'Dream Job' THEN 1 ELSE 2 END,
      c.name
  `).all();

  return NextResponse.json({ interviewing, radar });
}
