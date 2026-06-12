-- Daily Focus & Goal Dashboard automation log DDL draft
-- Draft only: do not run until Supabase project, migration plan, and backups are ready.

create table if not exists public.brief_logs (
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
  data_source text not null default 'chatgpt_automation',
  future_table_name text not null default 'brief_logs',
  automation_ready boolean not null default true,
  brief_date date not null,
  calendar_summary text not null default '',
  gmail_summary text not null default '',
  slack_summary text not null default '',
  automation_status text not null default '',
  priority_decision text not null default '',
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.ab_test_logs (
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
  data_source text not null default 'chatgpt_automation',
  future_table_name text not null default 'ab_test_logs',
  automation_ready boolean not null default true,
  test_date date not null,
  phrase text not null default '',
  variant text not null default '',
  judgement_criteria text not null default '',
  result text not null default '',
  hypothesis text not null default '',
  similar_test_idea text not null default '',
  user_feedback text not null default '',
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.ai_framework_checks (
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
  data_source text not null default 'chatgpt_automation',
  future_table_name text not null default 'ai_framework_checks',
  automation_ready boolean not null default true,
  check_date date not null,
  topic text not null default '',
  check_question text not null default '',
  answer_options jsonb not null default '[]'::jsonb,
  key_points jsonb not null default '[]'::jsonb,
  related_technology text not null default '',
  source_url text,
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.reminder_tasks (
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
  data_source text not null default 'chatgpt_automation',
  future_table_name text not null default 'reminder_tasks',
  automation_ready boolean not null default true,
  reminder_date date not null,
  source_url text not null default '',
  trigger_time text not null default '',
  source_automation_type text,
  original_text text,
  import_batch_id text,
  import_block_id text
);

create table if not exists public.automation_import_logs (
  id uuid primary key default gen_random_uuid(),
  legacy_json_id text unique,
  imported_at timestamptz not null default now(),
  source text not null default '',
  target_date date not null,
  status text not null default 'success' check (status in ('success', 'failed')),
  warnings jsonb not null default '[]'::jsonb,
  updated_files jsonb not null default '[]'::jsonb,
  import_batch_id text,
  original_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brief_logs_brief_date_idx on public.brief_logs(brief_date);
create index if not exists ab_test_logs_test_date_idx on public.ab_test_logs(test_date);
create index if not exists ai_framework_checks_check_date_idx on public.ai_framework_checks(check_date);
create index if not exists reminder_tasks_reminder_date_idx on public.reminder_tasks(reminder_date);
create index if not exists automation_import_logs_target_date_idx on public.automation_import_logs(target_date);
create index if not exists automation_import_logs_imported_at_idx on public.automation_import_logs(imported_at);
