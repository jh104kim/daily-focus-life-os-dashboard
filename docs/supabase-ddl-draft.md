# Supabase DDL Draft

This document is a draft only. Do not run these SQL files until a real Supabase project, migration strategy, backup plan, and adapter switch plan are confirmed.

## Scope

The current dashboard is backed by local `data/*.json` files. The draft schema keeps the same product boundaries and prepares a future migration to Supabase without changing the current JSON runtime.

Generated draft files:

- `supabase/schema-draft/001_life_os_core.sql`
- `supabase/schema-draft/002_automation_logs.sql`
- `supabase/schema-draft/003_weekly_logs.sql`

## Design Rules

- Every table uses `id uuid primary key default gen_random_uuid()`.
- Existing JSON string ids should be imported into `legacy_json_id text unique`.
- `created_at` and `updated_at` are `timestamptz`.
- `target_date` is `date` where the JSON entity has `targetDate`.
- `status` stays `text` with a check constraint matching the current app values.
- `progress` is `integer check (progress between 0 and 100)`.
- Array-like or open-ended fields use `jsonb` first, then can be normalized later if needed.
- Relationship columns use uuid candidates such as `related_goal_id`, `related_module_id`, and `related_focus_id`.
- Foreign keys are included as a draft and marked for migration review because the current JSON ids are string ids.
- RLS/Auth is not implemented in this step.

## JSON To Table Mapping

| JSON file | Supabase table | Notes |
| --- | --- | --- |
| `daily-focus-plans.json` | `daily_focus_plans` | `subGoals`, status booleans, week/month keys preserved. |
| `goals.json` | `goals` | `parentGoalId` and `relatedDailyFocusId` become uuid candidates. |
| `learning-modules.json` | `learning_modules` | Level fields constrained to 1-5. |
| `ai-applications.json` | `ai_applications` | `requiredSkills` and `relatedLearningModuleIds` use jsonb initially. |
| `reflections.json` | `reflections` | Daily arrays stay jsonb; `reflectionDate` maps to `reflection_date`. |
| `evidence-logs.json` | `evidence_logs` | Artifact/source fields preserved; `evidenceDate` maps to `evidence_date`. |
| `brief-logs.json` | `brief_logs` | Automation output log for morning brief. |
| `ab-test-logs.json` | `ab_test_logs` | Variant and phrase can be used for dedupe. |
| `ai-framework-checks.json` | `ai_framework_checks` | Answer options and key points use jsonb. |
| `reminder-tasks.json` | `reminder_tasks` | `reminderDate` maps to `reminder_date`. |
| `automation-import-logs.json` | `automation_import_logs` | Batch import audit trail. |
| `news-summary-logs.json` | `news_summary_logs` | Deferred weekly automation; parser still pending. |
| `investment-report-logs.json` | `investment_report_logs` | Deferred weekly ETF report check. |
| `investment-summary-logs.json` | `investment_summary_logs` | Deferred weekly investment summary. |

## Migration Notes

1. Create a JSON id to uuid mapping before loading relational fields.
2. Load parent tables first: `goals`, `learning_modules`, `daily_focus_plans`.
3. Load child/domain tables after relationship mapping is available.
4. Keep `legacy_json_id` until all app code and import logs are confirmed on uuid.
5. Keep the existing JSON adapter as fallback until Supabase reads and writes match current behavior.

## Deferred Items

- Supabase project creation.
- Supabase package installation.
- Supabase client creation.
- `.env.local` setup.
- Running SQL migrations.
- `supabase db push`.
- RLS/Auth policy implementation.
- JSON to Supabase migration script implementation.
- Runtime data adapter switch from JSON to Supabase.
