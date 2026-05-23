export type ExcitementLevel =
  | 'Dream Job'
  | 'Highly Considering'
  | 'Intriguing'
  | 'Not Sure Yet'
  | 'Never';

export type OpportunityStatus =
  | 'Applied'
  | 'Interviewing'
  | 'Rejected'
  | 'Early Discussions'
  | 'No Go'
  | 'Apply Soon';

export interface Company {
  id: number;
  name: string;
  excitement: ExcitementLevel;
  size_band: string | null;
  general_location: string | null;
  specific_location: string | null;
  description: string | null;
  domain: string | null;
  core_competencies: string | null;
  job_board_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyWithStats extends Company {
  total_opportunities: number;
  interviewing_count: number;
  applied_count: number;
  rejected_count: number;
}

export interface Opportunity {
  id: number;
  company_id: number;
  position_title: string;
  job_posting_url: string | null;
  status: OpportunityStatus;
  application_date: string;
  rejection_stage: string | null;
  contacts: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityWithCompany extends Opportunity {
  company_name: string;
  excitement: ExcitementLevel;
  general_location: string | null;
  company_description: string | null;
}

export interface DashboardStats {
  total_opportunities: number;
  actively_interviewing: number;
  total_rejections: number;
  dream_jobs_no_apps: number;
}

export const STATUS_OPTIONS: { value: OpportunityStatus; color: string }[] = [
  { value: 'Apply Soon', color: '#FCD34D' },
  { value: 'Applied', color: '#60A5FA' },
  { value: 'Early Discussions', color: '#C084FC' },
  { value: 'Interviewing', color: '#4ADE80' },
  { value: 'Rejected', color: '#F87171' },
  { value: 'No Go', color: '#9CA3AF' },
];

export const EXCITEMENT_OPTIONS: {
  value: ExcitementLevel;
  color: string;
  short: string;
}[] = [
  { value: 'Dream Job', color: '#4ADE80', short: 'Dream' },
  { value: 'Highly Considering', color: '#60A5FA', short: 'High' },
  { value: 'Intriguing', color: '#C084FC', short: 'Intriguing' },
  { value: 'Not Sure Yet', color: '#9CA3AF', short: 'Unsure' },
  { value: 'Never', color: '#F87171', short: 'Never' },
];
