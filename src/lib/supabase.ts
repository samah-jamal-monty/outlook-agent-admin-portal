import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface SupportSchedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  support_name: string;
  support_jira_id: string;
  support_jira_project_id: string;
  support_jira_project_key: string;
  created_at?: string;
  updated_at?: string;
}

export interface Config {
  id: string;
  support_email: string;
  assignee_id: string;
  assignee_name: string;
  project_id: string;
  project_key: string;
  support_schedule_id?: number;
  support_schedule?: SupportSchedule;
}

export interface Event {
  id: string;
  message_id: string;
  jira_ticket: string;
  jira_ticket_url: string;
  jira_status: string;
  created_at: string;
}
