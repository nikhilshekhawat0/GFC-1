-- Gurgaon Flood Command (GFC) — Supabase PostgreSQL + Realtime Schema
-- Run this script in your Supabase SQL Editor to enable multi-user real-time persistence.

create extension if not exists "pgcrypto";

-- 1. Citizen Flood Reports (with Gemini AI Multimodal Triage)
create table if not exists public.flood_reports (
  id text primary key,
  hotspot_id text,
  ward_no integer,
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null,
  photo_data_url text,
  ai_severity text check (ai_severity in ('critical', 'high', 'moderate', 'low')) default 'moderate',
  ai_depth_cm integer default 15,
  ai_blocked_drain boolean default false,
  ai_recommended_agency text default 'MCG',
  ai_summary text,
  ai_confidence integer default 80,
  status text check (status in ('pending', 'verified', 'dispatched', 'resolved')) default 'pending',
  created_at timestamptz not null default now()
);

-- 2. Crew Dispatches & SLA Escalation States
create table if not exists public.dispatch_actions (
  id text primary key,
  hotspot_id text not null,
  ward_no integer not null,
  action_type text not null,
  description text not null,
  assigned_crew_id text,
  sla_tier integer not null default 1,
  sla_deadline timestamptz not null,
  status text check (status in ('pending', 'in_progress', 'done', 'flagged', 'escalated')) default 'pending',
  is_override boolean default false,
  override_reason text,
  original_rank integer,
  rank_override integer,
  updated_by text default 'System',
  updated_at timestamptz not null default now()
);

-- 3. Immutable Governance Audit Logs
create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  actor text not null,
  action text not null,
  hotspot_id text not null,
  original_rank integer,
  new_rank integer,
  reason text
);

-- 4. Citizen SMS / WhatsApp / IVR Alert Subscriptions
create table if not exists public.alert_subscriptions (
  id text primary key,
  phone text not null,
  ward_no integer,
  sector_label text not null,
  channel text check (channel in ('sms', 'whatsapp', 'ivr')) default 'whatsapp',
  lang text check (lang in ('en', 'hi')) default 'en',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security with open hackathon demo policies (tighten with Auth for production)
alter table public.flood_reports enable row level security;
alter table public.dispatch_actions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.alert_subscriptions enable row level security;

create policy "Public read flood_reports" on public.flood_reports for select using (true);
create policy "Public insert flood_reports" on public.flood_reports for insert with check (true);
create policy "Public update flood_reports" on public.flood_reports for update using (true);

create policy "Public read dispatch_actions" on public.dispatch_actions for select using (true);
create policy "Public upsert dispatch_actions" on public.dispatch_actions for insert with check (true);
create policy "Public update dispatch_actions" on public.dispatch_actions for update using (true);

create policy "Public read audit_logs" on public.audit_logs for select using (true);
create policy "Public insert audit_logs" on public.audit_logs for insert with check (true);

create policy "Public read alert_subscriptions" on public.alert_subscriptions for select using (true);
create policy "Public insert alert_subscriptions" on public.alert_subscriptions for insert with check (true);

-- Enable Supabase Realtime publications
alter publication supabase_realtime add table public.flood_reports;
alter publication supabase_realtime add table public.dispatch_actions;
alter publication supabase_realtime add table public.audit_logs;
