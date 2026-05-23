import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { DashboardStats } from '@/lib/types';

export async function GET() {
  const db = getDb();
  const stats = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM opportunities) as total_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'Interviewing') as actively_interviewing,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'Rejected') as total_rejections,
        (SELECT COUNT(*) FROM companies WHERE excitement = 'Dream Job'
         AND id NOT IN (SELECT DISTINCT company_id FROM opportunities)) as dream_jobs_no_apps`
    )
    .get() as DashboardStats;
  return NextResponse.json(stats);
}
