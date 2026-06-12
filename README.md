# Daily Focus & Goal Dashboard

mock data 기반 로컬 웹 대시보드 MVP입니다. 매일 작성하는 오늘 집중 계획, 목표 관리, AI/AX 적용 관점, 저녁 회고, 산출물 로그, 자동화 로드맵을 한 화면 흐름으로 관리하기 위해 만들었습니다.

현재 1.5단계는 DB, Supabase, 외부 API 연결 없이 `data/*.json` 파일의 데이터만 사용합니다.

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
```

## 화면 사용법

### Home Dashboard

주소: `/`

오늘 핵심 목표, 전체 진행률, 완료 목표 수, 남은 과제 수를 확인합니다. 최근 회고와 최근 산출물, 향후 자동 업데이트 상태도 함께 볼 수 있습니다.

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

ChatGPT 자동화에서 생성된 `AI Education Focus Dashboard` 결과를 그대로 붙여넣어 `data/*.json` 파일에 저장합니다.

사용 순서:

1. ChatGPT 자동화 결과 전체를 복사합니다.
2. `/import` 화면의 textarea에 그대로 붙여넣습니다.
3. `미리보기` 버튼으로 파싱 결과를 확인합니다.
4. `저장` 버튼을 누릅니다.
5. 저장 후 `/`, `/focus`, `/learning`, `/ai-ax`, `/evidence` 화면을 새로고침해 반영 결과를 확인합니다.

저장 대상:

- `data/daily-focus-plans.json`
- `data/learning-modules.json`
- `data/ai-applications.json`
- `data/evidence-logs.json`

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

1단계 mock dashboard부터 5단계 Codex/Hermes/Sake 로컬 자동 실행까지 단계별 Todo, 필요 기술, 차단 조건을 확인합니다.

## 실제 내용 입력 방법

매일 바꾸는 실제 내용은 `data/` 폴더의 JSON 파일을 수정합니다.

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

## 2단계 확장 메모

다음 단계에서는 mock data를 Supabase 테이블로 옮길 수 있습니다.

권장 테이블 생성 순서:

1. `data_sources`
2. `goals`
3. `learning_modules`
4. `daily_focus_plans`
5. `ai_applications`
6. `reflections`
7. `evidence_logs`
8. `automation_runs`

전환 방향:

- `mock-data.ts` 직접 import를 데이터 어댑터 함수로 감쌉니다.
- `dataSource: "mock"` 값을 화면별로 `future_supabase`, `future_obsidian`, `future_json`로 전환합니다.
- Supabase URL/key는 2단계에서만 `.env.local`로 추가합니다.

## 제약

- 현재 DB 연결 없음
- 현재 Supabase 연결 없음
- 현재 외부 API 호출 없음
- 로그인 기능 없음
- 모든 화면은 mock data 기반 정적 렌더링
