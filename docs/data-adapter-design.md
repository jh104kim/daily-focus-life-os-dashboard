# Data Adapter Design

This is a design draft only. The current app still reads and writes local `data/*.json`. No Supabase runtime adapter is implemented in this step.

## Goal

Create a stable repository boundary so the app can later switch from JSON persistence to Supabase without rewriting dashboard components, import parsers, or bulk diff logic.

## Current State

- `lib/mock-data.ts` imports JSON files directly for page-level read paths.
- API routes use JSON persistence helpers for file reads, writes, backups, and import logs.
- Import parsing and diff generation work with TypeScript domain objects.
- Supabase DDL exists only as draft SQL under `supabase/schema-draft/`.

## Adapter Boundary

The adapter boundary should sit below UI/API workflows and above storage-specific code.

```text
UI / API route / parser
  -> repository interface
    -> JSON implementation now
    -> Supabase implementation later
```

The repository interfaces should not expose file paths, SQL, Supabase client instances, or JSON import mechanics.

## Common Repository Shape

Most entities need the same operations:

- `list()`
- `getById(id)`
- `getByDate(date)`
- `upsert(record)`
- `update(id, patch)`
- `remove(id)`
- `queryByWeek(weekKey)`
- `queryByMonth(monthKey)`

Not every repository must implement every method with special behavior. For example, `AutomationImportLogRepository.getByDate` can query `targetDate`, while `list()` can sort by `importedAt`.

## Initial Repository Set

- `DailyFocusRepository`
- `GoalRepository`
- `LearningModuleRepository`
- `AIApplicationRepository`
- `ReflectionRepository`
- `EvidenceLogRepository`
- `AutomationImportLogRepository`

Weekly deferred repositories can be added after parsers are implemented:

- `NewsSummaryLogRepository`
- `InvestmentReportLogRepository`
- `InvestmentSummaryLogRepository`

## Read Models

The first adapter pass should return the existing TypeScript domain types from `lib/types.ts`. That keeps UI and parser code stable.

Later, Supabase row types can be added separately:

- DB row type: snake_case, uuid, jsonb.
- Domain type: current camelCase app type.
- Mapper: row to domain, domain to insert/update payload.

## Write Semantics

`upsert(record)` should keep current import behavior:

- Prefer record `id` or `legacy_json_id` equivalent.
- Use date-based fallback where current JSON logic does.
- Merge patch fields without deleting unrelated existing fields.
- Return the saved domain record.

`update(id, patch)` should:

- Preserve `createdAt`.
- Update `updatedAt`.
- Not mutate the input patch.
- Return the updated domain record or `null` if not found.

`remove(id)` should:

- Be available in the interface.
- Remain unused by current import flows.
- Return a boolean so UI/API code can decide whether to show a not-found result.

## JSON Implementation Plan

The JSON implementation should wrap existing helpers:

- `readJsonFile`
- `writeJsonFile`
- `backupJsonFiles`
- `upsertJsonRecord`
- `updateJsonRecordFields`
- `appendAutomationImportLog`

No runtime code should be switched until the implementation is covered by the current parser fixture tests and import dry-run checks.

## Supabase Implementation Plan

The Supabase implementation should be added only after:

1. Supabase package installation is approved.
2. `.env.local` or deployment environment variables are approved.
3. SQL migrations are reviewed and applied in the target environment.
4. JSON to Supabase migration dry-run passes.

The implementation should:

- Initialize the Supabase client lazily.
- Map camelCase domain types to snake_case DB rows.
- Keep `legacy_json_id` available for migration and import reconciliation.
- Avoid changing parser output contracts.

## Suggested Files Later

Do not create these runtime implementations yet unless explicitly requested.

- `lib/json-data-adapter.ts`
- `lib/supabase-data-adapter.ts`
- `lib/data-mappers.ts`
- `lib/data-adapter.ts`

## Risks

- Current JSON ids are text; Supabase primary keys are uuid.
- Some relationships are optional or missing in older JSON records.
- Import flows rely on date-based dedupe in addition to id-based upsert.
- `relatedLearningModuleIds` is currently an array and may stay jsonb initially.
- RLS/Auth may change query patterns later.

## Recommended Next Step

Implement a JSON repository adapter first, behind the new interfaces, and switch one low-risk read path to it. Do not start with Supabase runtime code.
