# JSON To Supabase Migration Plan

This is a planning document only. It does not create a Supabase project, install packages, connect to a database, or run SQL.

## Goals

- Move the current local `data/*.json` records into the draft Supabase tables later.
- Preserve current JSON ids through `legacy_json_id`.
- Build a repeatable dry-run first, then a reversible migration.
- Keep the JSON adapter available until Supabase reads and writes match the current dashboard behavior.

## Source JSON Files

| JSON file | Target table | Primary date field | Upsert key |
| --- | --- | --- | --- |
| `daily-focus-plans.json` | `daily_focus_plans` | `targetDate`, `selectedDate` | `legacy_json_id`, then `selected_date` |
| `goals.json` | `goals` | `targetDate` | `legacy_json_id` |
| `learning-modules.json` | `learning_modules` | `targetDate` | `legacy_json_id` |
| `ai-applications.json` | `ai_applications` | `targetDate` | `legacy_json_id`, then `target_date + title` |
| `reflections.json` | `reflections` | `targetDate`, `reflectionDate` | `legacy_json_id`, then `reflection_date` |
| `evidence-logs.json` | `evidence_logs` | `targetDate`, `evidenceDate` | `legacy_json_id`, then `evidence_date + title` |
| `brief-logs.json` | `brief_logs` | `briefDate` | `legacy_json_id`, then `brief_date` |
| `ab-test-logs.json` | `ab_test_logs` | `testDate` | `legacy_json_id`, then `test_date + variant + phrase` |
| `ai-framework-checks.json` | `ai_framework_checks` | `checkDate` | `legacy_json_id`, then `check_date + topic` |
| `reminder-tasks.json` | `reminder_tasks` | `reminderDate` | `legacy_json_id`, then `reminder_date + title` |
| `automation-import-logs.json` | `automation_import_logs` | `targetDate`, `importedAt` | `legacy_json_id`, then `imported_at + source` |
| `news-summary-logs.json` | `news_summary_logs` | `targetWeek` | `legacy_json_id`, then `target_week` |
| `investment-report-logs.json` | `investment_report_logs` | `targetWeek` | `legacy_json_id`, then `target_week + report_type` |
| `investment-summary-logs.json` | `investment_summary_logs` | `targetWeek` | `legacy_json_id`, then `target_week` |

## Legacy ID Strategy

The JSON records currently use readable string ids such as `goal-monthly-001`. The Supabase draft uses uuid primary keys, so migration should never overwrite those ids directly into `id`.

Recommended strategy:

1. Generate a new uuid for every imported row.
2. Store the original JSON `id` in `legacy_json_id`.
3. Build an in-memory and persisted mapping file during migration:

```json
{
  "goals": {
    "goal-monthly-001": "uuid-value"
  },
  "learning_modules": {
    "module-rag-basic": "uuid-value"
  }
}
```

4. Use this mapping to translate `relatedGoalId`, `relatedModuleId`, `relatedFocusId`, `parentGoalId`, and `relatedDailyFocusId`.
5. Keep `legacy_json_id` indefinitely until imports, logs, and UI links no longer rely on JSON ids.

## Migration Order

The order should minimize missing relationship references.

1. Backup all current `data/*.json`.
2. Validate JSON shape and required fields.
3. Prepare id map for all files without writing records.
4. Migrate parent/core records:
   - `goals`
   - `learning_modules`
   - `daily_focus_plans`
5. Resolve cross references:
   - `goals.parent_goal_id`
   - `goals.related_daily_focus_id`
   - `daily_focus_plans.related_goal_id`
   - `daily_focus_plans.related_module_id`
6. Migrate domain records:
   - `ai_applications`
   - `reflections`
   - `evidence_logs`
7. Migrate automation logs:
   - `brief_logs`
   - `ab_test_logs`
   - `ai_framework_checks`
   - `reminder_tasks`
   - `automation_import_logs`
8. Migrate deferred weekly logs:
   - `news_summary_logs`
   - `investment_report_logs`
   - `investment_summary_logs`
9. Run count, relationship, and sample record verification.
10. Keep JSON mode active until Supabase adapter parity is verified.

## Foreign Key Connection Strategy

Foreign keys should be connected only after id mapping is complete.

- `relatedGoalId` maps to `related_goal_id`.
- `relatedModuleId` maps to `related_module_id`.
- `relatedFocusId` maps to `related_focus_id`.
- `parentGoalId` maps to `parent_goal_id`.
- `relatedDailyFocusId` maps to `related_daily_focus_id`.
- `relatedLearningModuleIds` starts as jsonb. Normalize later only if querying by each module becomes necessary.

If a legacy id is missing from the id map:

- Keep the row importable.
- Write the unresolved relationship to a migration warning report.
- Leave the uuid relationship column null.
- Preserve the original raw id in a migration diagnostics json field or report file.

## Dry-Run Strategy

The first migration script should support a `--dry-run` mode.

Dry-run must:

- Read every target JSON file.
- Validate required fields and date parsing.
- Build the full legacy id to uuid map.
- Print table-by-table insert/update counts.
- Print unresolved relationship counts.
- Print duplicate upsert key warnings.
- Print records that would violate status/progress checks.
- Write no database rows.

Recommended dry-run output:

```text
table=daily_focus_plans source=4 insert=4 update=0 unresolved_fk=0 warnings=0
table=evidence_logs source=4 insert=4 update=0 unresolved_fk=1 warnings=1
```

## Upsert Strategy

Primary upsert key:

- `legacy_json_id` where source JSON has `id`.

Fallback keys:

- Date-specific daily records: date field plus title or variant.
- Automation import logs: `legacy_json_id`, then `imported_at + source`.
- Weekly logs: `target_week`, plus report type where needed.

Rules:

- Do not update uuid primary keys.
- Preserve `created_at` from JSON `createdAt` when available.
- Set `updated_at` from JSON `updatedAt` when available.
- Never delete rows during initial migration.
- Emit warnings for rows that would overwrite existing non-null Supabase values.

## Rollback Strategy

Before live migration:

1. Export all current Supabase target tables to timestamped backups.
2. Keep a copy of the JSON source files and generated id map.
3. Run migration inside a transaction where possible.
4. If a table cannot be safely migrated transactionally, migrate into staging tables first.

Rollback options:

- Transaction rollback for failed all-in-one runs.
- Restore from Supabase table exports.
- Delete imported rows by `import_batch_id` if the migration writes one shared batch id.
- Rebuild from JSON source using the same id map if only relationship updates failed.

## Backup Strategy

Before migration:

- Copy all `data/*.json` to `data/backups/YYYY-MM-DD-HHmm/`.
- Export target Supabase tables if they already contain data.
- Save the generated `legacy-id-map.json`.
- Save a dry-run report and warning report.

Files to back up:

- `daily-focus-plans.json`
- `goals.json`
- `learning-modules.json`
- `ai-applications.json`
- `reflections.json`
- `evidence-logs.json`
- `brief-logs.json`
- `ab-test-logs.json`
- `ai-framework-checks.json`
- `reminder-tasks.json`
- `automation-import-logs.json`
- `news-summary-logs.json`
- `investment-report-logs.json`
- `investment-summary-logs.json`

## Validation Query Candidates

These are query ideas only. Do not run them in this step.

```sql
-- Count parity
select 'daily_focus_plans' as table_name, count(*) from public.daily_focus_plans;

-- Missing relationship check
select legacy_json_id, related_goal_id
from public.daily_focus_plans
where related_goal_id is null;

-- Status/progress check
select legacy_json_id, status, progress
from public.goals
where status not in ('planned', 'in_progress', 'done', 'blocked')
   or progress < 0
   or progress > 100;

-- Date coverage check
select target_date, count(*)
from public.evidence_logs
group by target_date
order by target_date desc;

-- Import log audit check
select target_date, status, count(*)
from public.automation_import_logs
group by target_date, status
order by target_date desc;
```

## Open Questions

- Whether to keep `related_learning_module_ids` as jsonb permanently or normalize it.
- Whether `automation_import_logs.id` should preserve import batch ids as text-only external ids.
- Whether deferred weekly investment fields need stricter numeric constraints.
- Whether RLS/Auth should wait until after a single-user Supabase adapter works.
