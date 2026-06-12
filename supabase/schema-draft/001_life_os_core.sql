-- Daily Focus & Goal Dashboard Supabase DDL draft
-- Draft only: do not run until Supabase project, migration plan, and backups are ready.

create extension if not exists pgcrypto;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  title text not null,
  description text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text not null default '',
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  data_source text not null default 'mock',
  future_table_name text not null default 'goals',
  automation_ready boolean not null default false,
  level text not null check (level in ('north_star', 'monthly', 'weekly', 'daily')),
  goal_level text check (goal_level in ('north_star', 'monthly', 'weekly', 'daily')),
  week_key text,
  month_key text,
  parent_goal_id uuid references public.goals(id), -- review after JSON id to uuid mapping
  related_daily_focus_id uuid, -- FK added after daily_focus_plans load order is finalized
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  title text not null,
  description text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text not null default '',
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  related_goal_id uuid references public.goals(id), -- review after JSON id to uuid mapping
  data_source text not null default 'mock',
  future_table_name text not null default 'learning_modules',
  automation_ready boolean not null default false,
  current_level integer not null check (current_level between 1 and 5),
  target_level integer not null check (target_level between 1 and 5),
  focus_today boolean not null default false,
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.daily_focus_plans (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  title text not null,
  description text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text not null default '',
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  related_goal_id uuid references public.goals(id), -- review after JSON id to uuid mapping
  related_module_id uuid references public.learning_modules(id), -- review after JSON id to uuid mapping
  data_source text not null default 'mock',
  future_table_name text not null default 'daily_focus_plans',
  automation_ready boolean not null default false,
  sub_goals jsonb not null default '[]'::jsonb,
  first_action text not null default '',
  completion_criteria text not null default '',
  expected_output text not null default '',
  must_not_miss text not null default '',
  review_notes text,
  sub_goal_statuses jsonb not null default '[]'::jsonb,
  first_action_done boolean not null default false,
  completion_checked boolean not null default false,
  actual_output text,
  must_not_miss_checked boolean not null default false,
  blocked_reason text,
  next_action text,
  selected_date date,
  week_key text,
  month_key text,
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

alter table public.goals
  add constraint goals_related_daily_focus_id_fkey
  foreign key (related_daily_focus_id)
  references public.daily_focus_plans(id);

create table if not exists public.ai_applications (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  title text not null,
  description text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text not null default '',
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  related_goal_id uuid references public.goals(id), -- review after JSON id to uuid mapping
  related_module_id uuid references public.learning_modules(id), -- review after JSON id to uuid mapping
  data_source text not null default 'mock',
  future_table_name text not null default 'ai_applications',
  automation_ready boolean not null default false,
  business_problem text not null default '',
  work_problem text,
  ai_solvable_form text not null default '',
  ai_transformed_form text,
  required_skills jsonb not null default '[]'::jsonb,
  expected_automation_effect text not null default '',
  expected_effect text,
  target_work text not null default '',
  related_learning_module_ids jsonb not null default '[]'::jsonb,
  automation_score integer not null default 0 check (automation_score between 0 and 100),
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  title text not null,
  description text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text not null default '',
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  related_goal_id uuid references public.goals(id), -- review after JSON id to uuid mapping
  related_module_id uuid references public.learning_modules(id), -- review after JSON id to uuid mapping
  related_focus_id uuid references public.daily_focus_plans(id), -- review after JSON id to uuid mapping
  data_source text not null default 'mock',
  future_table_name text not null default 'reflections',
  automation_ready boolean not null default false,
  completed jsonb not null default '[]'::jsonb,
  misses jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  morning_goal_review text,
  tomorrow_first_action text not null default '',
  tomorrow_goal_draft text not null default '',
  learnings jsonb not null default '[]'::jsonb,
  application_points jsonb not null default '[]'::jsonb,
  auto_fill_candidates jsonb not null default '[]'::jsonb,
  reflection_date date,
  applied_to_work jsonb not null default '[]'::jsonb,
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.evidence_logs (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  title text not null,
  description text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text not null default '',
  target_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  related_goal_id uuid references public.goals(id), -- review after JSON id to uuid mapping
  related_module_id uuid references public.learning_modules(id), -- review after JSON id to uuid mapping
  related_focus_id uuid references public.daily_focus_plans(id), -- review after JSON id to uuid mapping
  data_source text not null default 'mock',
  future_table_name text not null default 'evidence_logs',
  automation_ready boolean not null default false,
  output_type text not null default '',
  evidence_type text,
  artifact_link text not null default '',
  source_url text,
  note text not null default '',
  obsidian_candidate_path text not null default '',
  evidence_date date,
  review_status text check (review_status in ('pending', 'reviewed', 'applied')),
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create index if not exists goals_target_date_idx on public.goals(target_date);
create index if not exists learning_modules_target_date_idx on public.learning_modules(target_date);
create index if not exists daily_focus_plans_target_date_idx on public.daily_focus_plans(target_date);
create index if not exists ai_applications_target_date_idx on public.ai_applications(target_date);
create index if not exists reflections_target_date_idx on public.reflections(target_date);
create index if not exists evidence_logs_target_date_idx on public.evidence_logs(target_date);
