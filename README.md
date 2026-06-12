# Daily Focus & Goal Dashboard

mock data 기반 로컬 웹 대시보드 MVP입니다. 매일 작성하는 오늘 집중 계획, 목표 관리, AI/AX 적용 관점, 저녁 회고, 산출물 로그, 자동화 로드맵을 한 화면 흐름으로 관리하기 위해 만들었습니다.

현재 2.3단계는 DB, Supabase, 외부 API 연결 없이 `data/*.json` 파일의 데이터만 사용합니다.

## 실행 방법

의존성이 이미 설치되어 있으면 바로 실행합니다.

```bash
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000
```

프로덕션 빌드 확인은 아래 명령을 사용합니다.

```bash
npm run build
```

정적 타입과 lint 확인은 아래 명령을 사용합니다.

```bash
npx tsc --noEmit
npm run lint
npm run test:parsers
```

## 화면 사용법

### Home Dashboard

주소: `/`

캘린더에서 날짜를 선택하고 선택 날짜 기준 주간 대시보드, 오늘 운영 상태, 하루 요약 카드, Daily Focus 상세, 월간 요약을 확인합니다.

Home에서 바로 처리할 수 있는 작업:

- Bulk Automation Import Console로 여러 ChatGPT 자동화 결과 일괄 Import
- Daily Focus 검토/업데이트 텍스트 붙여넣기
- 저녁 회고와 산출물 로그 일괄 붙여넣기
- 하루 운영 체크리스트 확인

### Daily Focus Plan

주소: `/focus`

오늘의 핵심 목표, 서브 목표 2개, 가장 먼저 할 일, 완료 기준, 예상 산출물, 놓치면 안 되는 항목을 확인합니다. 관련 목표와 학습 모듈은 텍스트 링크로 연결됩니다.

### Goal Management

주소: `/goals`

북극성, 월간, 주간, 오늘 목표를 계층 구조로 확인합니다. 각 목표의 상태, 진행률, 마감일, 관련 Daily Focus 연결을 볼 수 있습니다.

### AI/AX Application

주소: `/ai-ax`

업무 문제를 AI로 해결 가능한 형태로 바꾸고, 필요한 기술, 예상 자동화 효과, 적용 대상 업무, 자동화 가능성 점수를 비교합니다.

### Learning / Skill Map

주소: `/learning`

AI Essential, RAG, Agentic Workflow, Text-to-SQL, Evaluation, AI Coding Assistant, Next.js/Supabase/Dashboard 등 학습 모듈의 현재 수준과 목표 수준을 확인합니다.

### Evening Reflection

주소: `/reflection`

오늘 완료한 것, 아쉬웠던 점, 내일 가장 먼저 할 일, 내일 핵심 목표 초안, 오늘 배운 것, 업무 적용 지점을 회고합니다. 다음 날 자동 입력 후보 필드는 점선 박스로 표시됩니다.

### Evidence / Output Log

주소: `/evidence`

문서, 코드, 대시보드, 회고 산출물을 테이블로 확인합니다. 타입 필터를 사용해 산출물 종류별로 볼 수 있고, 향후 Obsidian 저장 후보 경로가 표시됩니다.

### Import

주소: `/import`

Bulk Automation Import Console입니다. ChatGPT 자동화에서 생성된 여러 결과, Daily Focus 업데이트, 운영 기록을 textarea 하나에 그대로 붙여넣으면 block 단위로 분리하고 자동화 유형을 감지한 뒤 저장 대상 JSON으로 분류합니다.

사용 순서:

1. 하루 동안 받은 ChatGPT 자동화 결과를 모두 복사합니다.
2. Home의 `자동화 결과 Import` 또는 `/import` 화면 textarea에 한 번에 붙여넣습니다.
3. `미리보기` 버튼으로 자동화 block 분리, 감지 유형, 저장 대상 JSON, Diff를 확인합니다.
4. 필요한 파일/항목/필드만 체크하고 `선택 저장`을 누릅니다.
5. 저장 후 캘린더 선택 날짜와 `/focus`, `/learning`, `/ai-ax`, `/evidence` 화면에서 반영 결과를 확인합니다.

지원 자동화 유형:

- `oflow_morning_brief`
- `ai_education_focus`
- `evening_reflection`
- `daily_focus_ab_test`
- `ai_framework_check`
- `reminder_task`
- `daily_focus_update`
- `daily_operation_log`
- `unknown`

주요 저장 대상:

- `data/daily-focus-plans.json`
- `data/learning-modules.json`
- `data/ai-applications.json`
- `data/reflections.json`
- `data/evidence-logs.json`
- `data/brief-logs.json`
- `data/ab-test-logs.json`
- `data/ai-framework-checks.json`
- `data/reminder-tasks.json`

저장 전 안전장치:

- 미리보기에서 Import Batch ID, 자동화 block 개수, block별 유형/날짜/저장 대상, 파일별 Diff를 확인합니다.
- Diff에서 파일별/항목별/필드별 저장 여부를 선택할 수 있습니다.
- 날짜, 핵심 목표, 완료 기준, 첫 행동, 업무 문제, 필요한 기술이 누락되면 경고가 표시됩니다.
- 날짜가 없으면 오늘 날짜, progress가 없으면 `30`으로 자동 보정됩니다.
- 같은 날짜 데이터가 있으면 신규 생성이 아니라 업데이트 여부가 미리보기에서 표시됩니다.
- 저장 전에 기존 JSON 파일은 `data/backups/YYYY-MM-DD-HHmm/`에 자동 백업됩니다.
- 저장 기록은 `data/automation-import-logs.json`에 남습니다.

자동화 출력 마지막에 아래 블록을 붙이면 감지 정확도가 올라갑니다.

```text
[Dashboard Import Hint]
automationType:
targetDate:
primaryJson:
relatedJson:
```

Hint 처리 규칙:

- `automationType`이 있으면 자동 감지보다 우선합니다.
- `targetDate`가 있으면 본문 날짜나 오늘 날짜 보정보다 우선합니다.
- `primaryJson`, `relatedJson`은 저장 대상 JSON 후보에 추가 반영합니다.
- Hint가 없거나 일부 값이 비어 있어도 기존 자동 감지 로직으로 처리합니다.

지원하는 입력 형식 예:

```text
# AI Education Focus Dashboard - 2026-06-15

## 1. 오늘의 핵심 목표
- 구매 사양서 리스크 자동 분류 프롬프트 완성

## 2. 오늘의 학습/실행 모듈
- Prompt Risk Review

## 3. KPI Card 형식 요약
- 오늘의 진행률 목표: 67%
- 완료 기준: 리스크 유형, 승인 필요 조건, 후속 질문이 JSON 필드로 분리됨
- 남은 과제: 실제 사양서 2건으로 누락 조건 검증
- 예상 산출물: 구매 사양서 리스크 분류 프롬프트 v1

## 4. AI/AX 적용 관점
- 내 업무 문제: 발주 전 사양 리스크가 담당자 경험에 따라 다르게 검토된다.
- AI로 바꿀 수 있는 형태: 사양서 텍스트를 리스크 유형과 승인 필요 조건으로 구조화한다.
- 필요한 기술: 프롬프트 설계, JSON 스키마, 평가 기준
- 예상 자동화 효과: 1차 검토 시간을 40% 줄이고 질문 누락을 줄인다.

## 5. 오늘 첫 행동
- 최근 사양서 2건에서 리스크 유형을 직접 라벨링한다.
```

### Automation Roadmap

주소: `/automation`

1.0 mock dashboard부터 3.0 Supabase/DB 준비 Todo까지 단계별 Todo, 필요 기술, 차단 조건을 확인합니다. 3.0은 현재 구현 대상이 아니라 Todo 목록입니다.

## 현재 단계

- `1.0 mock dashboard`: 기본 화면과 mock data 검증 완료
- `1.5 data/*.json split`: 화면 데이터 JSON 분리 완료
- `1.6 import stabilization`: 단일 Import 미리보기, 백업, 로그 기반 안정화
- `1.7 calendar dashboard`: 날짜 선택 중심 Home Dashboard
- `1.8 daily operation input`: Daily Focus 검토, 회고, Evidence 입력
- `1.9 unified automation import`: 자동화 유형별 parser와 저장 대상 매핑
- `2.0 diff preview`: 저장 전/후 JSON Diff 확인
- `2.1 selected save`: 파일/항목/필드 단위 선택 저장
- `2.2 bulk automation import console`: 여러 자동화 결과 일괄 붙여넣기
- `2.3 parser fixture tests`: 핵심 parser fixture 테스트
- `3.0 Supabase / DB preparation`: 구현 없이 Todo로만 관리

## Parser Fixture 테스트

핵심 parser가 깨지지 않도록 아래 fixture를 사용합니다.

```text
tests/fixtures/oflow-morning-brief.txt
tests/fixtures/ai-education-focus.txt
tests/fixtures/evening-reflection.txt
tests/fixtures/daily-focus-ab-test.txt
tests/fixtures/ai-framework-check.txt
tests/fixtures/reminder-task.txt
tests/fixtures/daily-focus-update.txt
tests/fixtures/daily-operation-log.txt
tests/fixtures/unknown.txt
tests/fixtures/bulk-mixed-automation.txt
```

실행:

```bash
npm run test:parsers
```

검증 항목:

- 자동화 유형 감지
- Bulk block 개수
- `targetDate` 추출
- 저장 대상 JSON 후보
- `unknown` block 저장 제외
- Diff 생성 여부

## 실제 자동화 원문 Bulk Import 테스트

`automation_inputs_full_for_bulk_import_test.md` 파일이 있으면 아래 방식으로 실제 자동화 원문 모음을 검증합니다.

1. 파일 전체 내용을 복사합니다.
2. `/import`의 Bulk Automation Import Console textarea에 그대로 붙여넣습니다.
3. `미리보기`로 `detectedBlockCount`, `parsedBlockCount`, `unknownBlockCount`, block별 `automationType`, `targetDate`, 저장 대상 JSON, warning을 확인합니다.
4. Diff에서 파일별 `added`, `updated`, `removed`, `changedFields`를 확인합니다.
5. 실제 저장 테스트는 전체 저장 대신 `reminder-tasks.json` 1건 또는 `evidence-logs.json` 1건만 선택 저장합니다.
6. 저장 후 `backupPath`, `importLogId`, `selectedSummary`를 확인하고 테스트 데이터는 원복합니다.

현재 DB/Supabase는 Todo 상태입니다. 이 테스트는 로컬 `data/*.json`과 `/api/bulk-automation-import`만 사용합니다.

## 보류 중인 unknown 자동화

`automation_inputs_full_for_bulk_import_test.md` Bulk Import 검증에서 아래 3개 자동화는 의도적으로 `unknown`으로 유지합니다. 현재 출력은 주간 뉴스/투자 알림성 원문이고, Daily Focus/Reflection/Evidence/Reminder 중 하나로 억지 매핑하면 저장 의미가 흐려집니다. 먼저 별도 저장 스키마를 정의하고 Home Dashboard에서 상태만 확인한 뒤 parser 구현 여부를 결정합니다.

| 현재 원문 제목 | 후보 automationType | 후보 저장 JSON | 보조 저장 |
| --- | --- | --- | --- |
| `Send weekly news summary` | `weekly_news_summary` | `data/news-summary-logs.json` | `data/evidence-logs.json` |
| `Check weekly ETF report` | `weekly_etf_report_check` | `data/investment-report-logs.json` | `data/evidence-logs.json` |
| `Send weekly investment summary` | `weekly_investment_summary` | `data/investment-summary-logs.json` | `data/evidence-logs.json` |

후보 필드:

- `weekly_news_summary`: `id`, `targetWeek`, `generatedAt`, `koreaNews`, `usNews`, `globalNews`, `aiNews`, `summary`, `sourceAutomationType`, `dataSource`, `importBatchId`
- `weekly_etf_report_check`: `id`, `targetWeek`, `reportType`, `reportUrl`, `keyChanges`, `summary`, `actionItems`, `sourceAutomationType`, `dataSource`, `importBatchId`
- `weekly_investment_summary`: `id`, `targetWeek`, `accounts`, `requiredCashByAccount`, `grandTotalKrw`, `fxRate`, `assetNews`, `actionItems`, `summary`, `sourceAutomationType`, `dataSource`, `importBatchId`

현재 상태:

- 후보 타입은 `lib/types.ts`에 정의되어 있습니다.
- 후보 JSON 파일은 빈 배열로 준비되어 있습니다.
- Home Dashboard의 Weekly Automation Summary 패널에서 선택 날짜의 `weekKey` 기준으로 3개 후보 자동화 상태를 표시합니다.
- 현재 빈 JSON 상태에서는 `parser_pending`과 `데이터 없음 / parser pending`으로 표시합니다.
- `AutomationType` union과 parser/router에는 아직 연결하지 않았습니다.
- Bulk Import에서는 계속 `unknown`으로 유지하며, 사용 빈도가 확인되면 별도 parser 구현을 검토합니다.
- 별도 `/weekly` 페이지는 뉴스/ETF/투자 정보량이 커질 때 추가할 Roadmap Todo입니다.
- `tests/fixtures/automation-inputs-full.md`는 계속 parsed `9`, unknown `3`을 기대합니다.
- DB/Supabase 전환은 Todo 상태이며 실제 연결 코드는 없습니다.

## 실제 내용 입력 방법

권장 입력 방식은 Home Dashboard에서 처리하는 것입니다.

1. `/`에서 캘린더 날짜를 선택합니다.
2. `자동화 결과 Import`를 열고 오늘 계획, Daily Focus 업데이트, 저녁 회고, 산출물 로그를 한 번에 붙여넣습니다.
3. 미리보기에서 block 분리 결과와 `daily-focus-plans.json`, `reflections.json`, `evidence-logs.json` 등 저장 대상 Diff를 확인합니다.
4. 저장할 파일/항목/필드만 선택합니다.
5. `선택 저장` 후 캘린더와 대시보드 반영 결과를 확인합니다.

필요하면 `data/` 폴더의 JSON 파일을 직접 수정할 수도 있습니다.

```text
data/daily-focus-plans.json
data/goals.json
data/ai-applications.json
data/learning-modules.json
data/reflections.json
data/evidence-logs.json
data/automation-roadmap.json
data/data-source-status.json
```

예를 들어 학습 모듈을 바꾸려면 `data/learning-modules.json`에서 `title`, `description`, `progress`, `currentLevel`, `targetLevel`, `focusToday` 값을 수정합니다.

```json
{
  "id": "module-next-dashboard",
  "title": "Next.js / JSON / Dashboard",
  "description": "App Router 기반 화면 구성과 JSON 데이터 입력 구조를 분리해 관리하는 방법.",
  "status": "in_progress",
  "progress": 58,
  "category": "Dashboard",
  "targetDate": "2026-06-30",
  "createdAt": "2026-06-01T09:00:00+09:00",
  "updatedAt": "2026-06-12T10:20:00+09:00",
  "relatedGoalId": "goal-monthly-001",
  "dataSource": "mock",
  "futureTableName": "learning_modules",
  "automationReady": true,
  "currentLevel": 3,
  "targetLevel": 4,
  "focusToday": true
}
```

`npm run dev` 실행 중이면 저장 후 브라우저를 새로고침하면 변경 내용이 반영됩니다.

주의할 점:

- JSON은 주석을 쓸 수 없습니다.
- 문자열은 반드시 큰따옴표를 사용합니다.
- 마지막 항목 뒤에는 쉼표를 붙이지 않습니다.
- `status`는 `"planned"`, `"in_progress"`, `"done"`, `"blocked"` 중 하나를 사용합니다.
- 현재 `dataSource`는 모두 `"mock"`으로 둡니다.

## 데이터 구조

핵심 타입은 `lib/types.ts`에 있습니다.

실제 입력 데이터는 `data/*.json`에 분리되어 있습니다.

`lib/mock-data.ts`는 JSON 파일을 import해서 기존 화면 코드에 export하는 어댑터 역할만 합니다.

공통 유틸은 `lib/dashboard-utils.ts`에 있습니다.

주요 엔티티:

- `dailyFocusPlans`
- `goals`
- `aiApplications`
- `learningModules`
- `reflections`
- `evidenceLogs`
- `automationRoadmap`
- `dataSourceStatus`

각 엔티티는 향후 Supabase/Obsidian/JSON 전환을 고려해 아래 필드를 포함합니다.

- `dataSource`
- `futureTableName`
- `automationReady`
- `relatedGoalId`
- `relatedModuleId`

## 3.0 Supabase / DB 준비 Todo

현재 환경에서는 DB/Supabase를 실제 구현하지 않습니다. 아래 항목은 다음 PC/환경에서 진행할 Todo입니다.

- Supabase 프로젝트 생성
- `daily_focus_plans` 테이블 설계
- `goals` 테이블 설계
- `learning_modules` 테이블 설계
- `ai_applications` 테이블 설계
- `reflections` 테이블 설계
- `evidence_logs` 테이블 설계
- `brief_logs` 테이블 설계
- `ab_test_logs` 테이블 설계
- `ai_framework_checks` 테이블 설계
- `reminder_tasks` 테이블 설계
- `automation_import_logs` 테이블 설계
- JSON to Supabase migration script 설계
- Next.js data adapter를 JSON/Supabase 교체 가능하게 분리
- RLS/Auth는 MVP 이후 검토

금지 사항:

- Supabase package 설치하지 않음
- Supabase client 만들지 않음
- `.env.local` 만들지 않음
- DB 연결 코드 작성하지 않음
- SQL migration 실행하지 않음
- 실제 DDL 파일은 사용자가 명시적으로 요청할 때만 생성

## 제약

- 현재 DB 연결 없음
- 현재 Supabase 연결 없음
- 현재 외부 API 호출 없음
- 로그인 기능 없음
- 모든 화면은 mock data 기반 정적 렌더링
