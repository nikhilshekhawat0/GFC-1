import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface FloodReportRecord {
  id: string;
  hotspot_id: string | null;
  ward_no: number | null;
  location_name: string;
  lat: number;
  lng: number;
  description: string;
  photo_data_url?: string | null;
  ai_severity: 'critical' | 'high' | 'moderate' | 'low';
  ai_depth_cm: number;
  ai_blocked_drain: boolean;
  ai_recommended_agency: string;
  ai_summary: string | null;
  ai_confidence: number;
  status: 'pending' | 'verified' | 'dispatched' | 'resolved';
  created_at: string;
}

export interface DispatchActionRecord {
  id: string;
  hotspot_id: string;
  ward_no: number;
  action_type: string;
  description: string;
  assigned_crew_id: string | null;
  sla_tier: number;
  sla_deadline: string;
  status: 'pending' | 'in_progress' | 'done' | 'flagged' | 'escalated';
  is_override: boolean;
  override_reason?: string | null;
  original_rank?: number | null;
  rank_override?: number | null;
  updated_by: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: 'system_ranking' | 'manual_override' | 'sensor_flagged' | 'alert_issued' | 'action_completed' | 'sla_escalated' | 'citizen_report_triaged';
  hotspot_id: string;
  original_rank: number | null;
  new_rank: number | null;
  reason: string | null;
}

export interface AlertSubscriptionRecord {
  id: string;
  phone: string;
  ward_no: number | null;
  sector_label: string;
  channel: 'sms' | 'whatsapp' | 'ivr';
  lang: 'en' | 'hi';
  created_at: string;
}

export async function fetchSupabaseSnapshot(): Promise<{
  reports: FloodReportRecord[];
  dispatches: DispatchActionRecord[];
  audits: AuditLogRecord[];
} | null> {
  if (!supabase) return null;
  try {
    const [reportsRes, dispatchRes, auditRes] = await Promise.all([
      supabase.from('flood_reports').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('dispatch_actions').select('*').order('updated_at', { ascending: false }).limit(200),
      supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(150),
    ]);

    if (reportsRes.error || dispatchRes.error || auditRes.error) {
      console.warn('[GFC Supabase] Query warning:', reportsRes.error || dispatchRes.error || auditRes.error);
      return null;
    }

    return {
      reports: (reportsRes.data || []) as FloodReportRecord[],
      dispatches: (dispatchRes.data || []) as DispatchActionRecord[],
      audits: (auditRes.data || []) as AuditLogRecord[],
    };
  } catch (err) {
    console.warn('[GFC Supabase] Snapshot fallback:', err);
    return null;
  }
}

export async function persistFloodReport(record: FloodReportRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('flood_reports').upsert(record, { onConflict: 'id' });
  if (error) {
    console.warn('[GFC Supabase] insert flood_reports error:', error.message);
    return false;
  }
  return true;
}

export async function updateFloodReportStatusInDb(
  id: string,
  status: FloodReportRecord['status']
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('flood_reports').update({ status }).eq('id', id);
  return !error;
}

export async function persistDispatchAction(record: DispatchActionRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('dispatch_actions').upsert(record, { onConflict: 'id' });
  if (error) {
    console.warn('[GFC Supabase] upsert dispatch_actions error:', error.message);
    return false;
  }
  return true;
}

export async function persistAuditLog(record: AuditLogRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('audit_logs').insert(record);
  if (error) {
    console.warn('[GFC Supabase] insert audit_logs error:', error.message);
    return false;
  }
  return true;
}

export async function persistAlertSubscription(record: AlertSubscriptionRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('alert_subscriptions').insert(record);
  if (error) {
    console.warn('[GFC Supabase] insert alert_subscriptions error:', error.message);
    return false;
  }
  return true;
}
