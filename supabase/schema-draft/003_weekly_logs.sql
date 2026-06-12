-- Daily Focus & Goal Dashboard deferred weekly automation DDL draft
-- Draft only: weekly parsers are still intentionally pending.

create table if not exists public.news_summary_logs (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  target_week date not null,
  generated_at timestamptz not null default now(),
  korea_news jsonb not null default '[]'::jsonb,
  us_news jsonb not null default '[]'::jsonb,
  global_news jsonb not null default '[]'::jsonb,
  ai_news jsonb not null default '[]'::jsonb,
  summary text not null default '',
  source_automation_type text not null default 'weekly_news_summary',
  data_source text not null default 'chatgpt_automation',
  import_batch_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_report_logs (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  target_week date not null,
  report_type text not null default '',
  report_url text not null default '',
  key_changes jsonb not null default '[]'::jsonb,
  summary text not null default '',
  action_items jsonb not null default '[]'::jsonb,
  source_automation_type text not null default 'weekly_etf_report_check',
  data_source text not null default 'chatgpt_automation',
  import_batch_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_summary_logs (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  target_week date not null,
  accounts jsonb not null default '[]'::jsonb,
  required_cash_by_account jsonb not null default '{}'::jsonb,
  grand_total_krw numeric(18, 2),
  fx_rate numeric(18, 6),
  asset_news jsonb not null default '[]'::jsonb,
  action_items jsonb not null default '[]'::jsonb,
  summary text not null default '',
  source_automation_type text not null default 'weekly_investment_summary',
  data_source text not null default 'chatgpt_automation',
  import_batch_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_summary_logs_target_week_idx on public.news_summary_logs(target_week);
create index if not exists investment_report_logs_target_week_idx on public.investment_report_logs(target_week);
create index if not exists investment_summary_logs_target_week_idx on public.investment_summary_logs(target_week);
