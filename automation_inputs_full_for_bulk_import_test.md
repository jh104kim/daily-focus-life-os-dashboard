# ChatGPT 자동화 입력 원문 모음 - Bulk Import Test

생성일: 2026-06-12
용도: Daily Focus & Goal Dashboard의 Bulk Automation Import Console 테스트용 입력 파일.
범위: 현재 자동화 목록에서 활성 자동화 전체 + 비활성 자동화 주요 원문.

---

# 1. Oflow Morning Brief

enabled: true
automationType: oflow_morning_brief
schedule:
```text
BEGIN:VEVENT
DTSTART:20260613T073000
RRULE:FREQ=DAILY;BYHOUR=7;BYMINUTE=30;BYSECOND=0
END:VEVENT
```

```text
매일 07:30에 Oflow Morning Brief를 실행한다.

목적:
하루 시작 전 Calendar, Gmail, Slack, 자동화 상태를 확인하고, 사용자의 Daily Check 입력을 받아 최종 Life OS Markdown을 생성한다.

실행 순서:
1. Google Calendar에서 오늘 날짜의 일정을 조회해 핵심 일정, 시간, 놓치면 안 되는 항목을 요약한다.
2. Gmail에서 받은편지함과 미읽음 메일 중 중요해 보이는 항목을 선별해 요약한다. 광고성/뉴스레터성 메일은 제외하고, GitHub, Google, Supabase, Slack, 결제, 보안, 업무/자동화 관련 메일을 우선한다.
3. Slack에서 최근 확인 필요 메시지나 알림을 요약한다. 개인 운영 채널, Hermes/Sake/Oflow/자동화 관련 채널을 우선한다.
4. GitHub Actions, Hermes Gateway, Slack Bot Token 관련 실패 징후가 있으면 자동화 상태에 별도 표시한다.
5. 위 1~4 결과와 아래 Daily Check 입력 템플릿을 포함한 1차 Oflow Morning Brief를 사용자에게 보여준다.
6. 같은 1차 Oflow Morning Brief 내용을 Gmail로도 발송한다.
   - 받는 사람: jh104.kim@samsung.com
   - 제목: Oflow Morning Brief - YYYY-MM-DD
   - 본문: 오늘 일정 요약, Gmail 핵심 요약, Slack 확인 필요 항목, 자동화 상태, 우선순위 판단, 오늘 놓치면 안 되는 것, Daily Check 입력 템플릿
   - 주의: 이 1차 메일은 사용자의 Daily Check 답변 전 브리프이며 최종본이 아님을 표시한다.
7. 사용자에게 아래 Daily Check 형식으로 답변을 요청한다.

[Daily Check]
오늘의 핵심 목표 1개:
서브 목표 1:
서브 목표 2:
어제 회고 1줄:
오늘 가장 먼저 할 일:

8. 사용자가 답변하면 Calendar/Gmail/Slack/자동화 상태와 Daily Check 답변을 합쳐 최종 Markdown을 만든다.
9. 최종 Markdown을 Slack 개인 운영 채널 C0B4A7ND4TC에 전송한다.
10. 최종 Markdown을 Gmail로도 발송한다.
   - 받는 사람: jh104.kim@samsung.com
   - 제목: Oflow Morning Brief Final - YYYY-MM-DD
11. 같은 내용을 YYYY-MM-DD-daily-check.md 파일로 생성한다.
12. 사용자가 스마트폰에서 다운로드 후 Obsidian vault로 이동할 수 있도록 링크를 제공한다.

최종 Markdown 형식:
# Oflow Morning Brief - YYYY-MM-DD

## 오늘의 핵심 목표
-

## 서브 목표
-
-

## 어제 회고
-

## 오늘 첫 행동
-

## 오늘 일정 요약
-

## Gmail 핵심 요약
-

## Slack 확인 필요 항목
-

## 자동화 상태
-

## 우선순위 판단
-

## 오늘 놓치면 안 되는 것
-

주의:
- 07:30 1차 브리프는 Gmail로 jh104.kim@samsung.com에 발송한다.
- 사용자가 답변하기 전에는 Slack 채널에 최종 요약을 보내지 않는다.
- 사용자가 답변하면 최종본을 Slack 개인 운영 채널 C0B4A7ND4TC와 Gmail로 jh104.kim@samsung.com에 보낸다.
- 최종본은 Slack 전송용 Markdown과 .md 다운로드 파일 링크를 함께 제공한다.
```

[Dashboard Import Hint]
automationType: oflow_morning_brief
targetDate: YYYY-MM-DD
primaryJson: daily-focus-plans.json
relatedJson: brief-logs.json,evidence-logs.json

---

# 2. AI 교육 집중 계획

enabled: true
automationType: ai_education_focus
schedule:
```text
BEGIN:VEVENT
DTSTART:20260525T080000
RRULE:FREQ=DAILY;BYHOUR=8;BYMINUTE=0;BYSECOND=0
END:VEVENT
```

```text
매일 오전 8시에 사용자의 일일 집중 계획과 목표 정리를 생성한다.

목적:
사용자의 하루 목표를 단순 체크리스트가 아니라 AI 교육/AI 업무 적용 대시보드에 들어갈 수 있는 구조로 정리한다. 사용자의 기본 사고 흐름인 “내 업무 문제 → AI로 해결 가능한 형태로 바꾸기 → 필요한 기술만 공부”를 반드시 반영한다.

응답 형식:
# AI Education Focus Dashboard - YYYY-MM-DD

## 1. 오늘의 핵심 목표
- 오늘 가장 중요한 목표 1개를 한 문장으로 제안한다.

## 2. 오늘의 학습/실행 모듈
아래 중 오늘 맥락에 맞는 1~2개만 고른다.
- AI Essential
- RAG 기초/심화
- Agentic Workflow
- Text-to-SQL
- Evaluation / RAGAS
- AI Coding Assistant
- Next.js / Supabase / Dashboard
- C&M Dashboard / Raw Data / KPI Flow

## 3. KPI Card 형식 요약
- 오늘의 진행률 목표: 0~100%
- 완료 기준: 무엇을 하면 완료인지 1줄
- 남은 과제: 오늘 넘기지 말아야 할 것 1개
- 예상 산출물: 문서/코드/대시보드/정리노트 중 1개

## 4. AI/AX 적용 관점
- 내 업무 문제:
- AI로 바꿀 수 있는 형태:
- 필요한 기술:
- 예상 자동화 효과:

## 5. 오늘 첫 행동
- 지금 바로 시작할 수 있는 10~30분짜리 행동 1개를 제안한다.

## 6. 입력 템플릿
오늘의 핵심 목표:
오늘의 학습/실행 모듈:
내 업무 문제:
AI로 바꿀 수 있는 형태:
필요한 기술:
오늘 첫 행동:
완료 기준:

## 7. Codex/Claude Code 입력용 /goal 프롬프트
마지막에 반드시 사용자가 Codex CLI 또는 Claude Code에 그대로 붙여넣을 수 있는 프롬프트를 생성한다.
```

[Dashboard Import Hint]
automationType: ai_education_focus
targetDate: YYYY-MM-DD
primaryJson: daily-focus-plans.json
relatedJson: learning-modules.json,ai-applications.json,evidence-logs.json

---

# 3. Evening Reflection

enabled: true
automationType: evening_reflection
schedule:
```text
BEGIN:VEVENT
DTSTART:20260610T180000
RRULE:FREQ=DAILY;BYHOUR=18;BYMINUTE=0;BYSECOND=0
END:VEVENT
```

```text
매일 저녁 6시에 사용자에게 알림을 주고, 사용자가 아침에 작성한 Daily Check / 일일 집중 계획을 바탕으로 짧은 저녁 회고를 작성하도록 안내한다.

응답 형식은 항상 아래 5개 섹션으로 유지한다.

## 저녁 회고

### 1) 오늘 아침 핵심 목표 확인
아침 Daily Check 또는 일일 집중 계획에서 잡은 핵심 목표를 1~2줄로 확인한다.

### 2) 오늘 완료한 것
사용자가 바로 적을 수 있도록 빈칸형 문장으로 제시한다.

### 3) 아쉬웠던 점 또는 막힌 점
막힌 지점, 미완료 이유, 내일로 넘길 것을 짧게 적게 한다.

### 4) 내일 가장 먼저 할 일
오늘 회고와 아침 목표를 연결해서 내일 첫 행동 1개를 제안한다. 가능하면 작고 실행 가능한 행동으로 쓴다.

### 5) 내일 핵심 목표 초안
내일의 핵심 목표를 1문장으로 제안한다.

입력 템플릿:
오늘 완료한 것:
아쉬웠던 점/막힌 점:
내일 가장 먼저 할 일:
내일 핵심 목표 초안:
```

[Dashboard Import Hint]
automationType: evening_reflection
targetDate: YYYY-MM-DD
primaryJson: reflections.json
relatedJson: evidence-logs.json,daily-focus-plans.json

---

# 4. Daily Focus A/B 카드

enabled: true
automationType: daily_focus_ab_test
schedule:
```text
BEGIN:VEVENT
DTSTART:20260606T080614Z
RRULE:FREQ=DAILY;BYHOUR=6;BYMINUTE=45;BYSECOND=0
END:VEVENT
```

```text
Tell me to run today's Daily Focus Card A/B Test. Use the previous feedback when choosing the phrase.

Known feedback so far:
Variant A '지금 끝내기' received '별로' because overly direct command-style wording felt burdensome.
Variant B '오늘 한 줄' received '완료' with note: '오늘은 오제가나는 첫날이다. 설렌다.'
Variant E '오늘도 한 줄만' received '완료' with note: '어제 오제누마에서 야시노 산장까지 17km 트레킹하면서, 새로운 트레킹화를 신고 와서 뒤꿈치가 까지는 문제가 발생했으나 트레킹 완료.'
Variant F '남는 장면 하나' received '완료' with reflection: '뒤꿈치가 까져서 집에 왔는데 가족들이 별거 아닌 듯해서 기분이 나쁘고 어제 폭발했다. 내일 생일이라 오늘 저녁을 먹기로 해서 분위기가 애매하다.'
Variant H '오늘은 마음만 확인' received '완료'.
Variant I '지금 마음에 맞는 하나' received '완료' with note: '아직 마음은 조금 무겁지만, 오늘은 무리하지 않고 업무 복귀 리듬 하나만 잡는다.'

Include:
오늘의 문구
실험 Variant
내 판단 기준
완료/미완료 판단
왜 이 문구가 효과 있을지
유사 테스트 아이디어

사용자는 완료, 미완료, 별로로 답할 수 있다.
```

[Dashboard Import Hint]
automationType: daily_focus_ab_test
targetDate: YYYY-MM-DD
primaryJson: ab-test-logs.json
relatedJson: reflections.json,evidence-logs.json

---

# 5. AI Framework Check

enabled: true
automationType: ai_framework_check
schedule:
```text
BEGIN:VEVENT
DTSTART:20260602T075341
RRULE:FREQ=DAILY;BYHOUR=6;BYMINUTE=50;BYSECOND=0
END:VEVENT
```

```text
매일 아침 최신 AI 프레임워크/에이전트/풀스택 개발 관련 핫한 주제 1개를 선정해 사용자에게 체크 질문을 던져라.

사용자의 기존 관심사인 Claude/Opus 최신 릴리스, Claude Agent Teams, Opus Goals, Codex/Hermes/Sake, MCP, A2A, LangChain/LangGraph, Dify, RAG/AI 자동화, 사내 AX/CNN/AXPI 과제와 연결되는 주제를 우선하라.

또한 주제 범위를 AI 프레임워크에만 한정하지 말고 웹 디자인, UI/UX, 백엔드, 데이터베이스, 배포, Hermes 활용, Slack/Obsidian/GitHub/Codex 연동, Next.js/Supabase/Vercel, Figma/Mobbin/Refero/Lapa Ninja/Webframe 기반 풀스택 빌드까지 다양하게 포함하라.

형식은:
1) 오늘의 주제
2) 30초 체크 질문
3) 사용자가 '안다/모른다/애매하다'로 답하게 하는 선택지
4) 모른다고 답하면 설명해줄 핵심 포인트 예고 3개
```

[Dashboard Import Hint]
automationType: ai_framework_check
targetDate: YYYY-MM-DD
primaryJson: ai-framework-checks.json
relatedJson: learning-modules.json,evidence-logs.json

---

# 6. 야리가다케산장 예약

enabled: true
automationType: reminder_task
schedule:
```text
BEGIN:VEVENT
DTSTART:20260708T085500
END:VEVENT
```

```text
야리가다케산장 2026년 8월 8일 숙박 예약을 바로 진행하라고 알려줘.
예약 대상은 성인 5명이며, 예약 사이트는 https://www.yarigatake.net/reservation/yarigatake/ 이다.
예약 오픈은 오전 9시이므로 즉시 접속해 예약해야 한다.
```

[Dashboard Import Hint]
automationType: reminder_task
targetDate: 2026-07-08
primaryJson: reminder-tasks.json
relatedJson: evidence-logs.json

---

# 7. 야리사와산장 예약

enabled: true
automationType: reminder_task
schedule:
```text
BEGIN:VEVENT
DTSTART:20260707T085500
END:VEVENT
```

```text
야리사와산장 2026년 8월 7일 숙박 예약을 바로 진행하라고 알려줘.
예약 대상은 성인 5명이며, 예약 사이트는 https://www.yarigatake.net/reservation/yarisawa/ 이다.
예약 오픈은 오전 9시이므로 즉시 접속해 예약해야 한다.
```

[Dashboard Import Hint]
automationType: reminder_task
targetDate: 2026-07-07
primaryJson: reminder-tasks.json
relatedJson: evidence-logs.json

---

# 8. Daily Check Brief

enabled: false
automationType: oflow_morning_brief

```text
매일 07:30에 Daily Check + Life OS Brief를 실행한다.

[Daily Check]
오늘의 핵심 목표 1개:
서브 목표 1:
서브 목표 2:
어제 회고 1줄:
오늘 가장 먼저 할 일:

최종 Markdown 형식:
# Daily Check + Life OS Brief - YYYY-MM-DD

## 오늘의 핵심 목표
-

## 서브 목표
-
-

## 어제 회고
-

## 오늘 첫 행동
-

## 오늘 일정 요약
-

## Gmail 핵심 요약
-

## Slack 확인 필요 항목
-

## 우선순위 판단
-

## 오늘 놓치면 안 되는 것
-
```

[Dashboard Import Hint]
automationType: oflow_morning_brief
targetDate: YYYY-MM-DD
primaryJson: daily-focus-plans.json
relatedJson: brief-logs.json,evidence-logs.json

---

# 9. 실행해 Daily Focus A/B 테스트

enabled: false
automationType: daily_focus_ab_test

```text
Tell me today's Daily Focus Card A/B test variant based on this fixed 4-day plan:
2026-05-29 A = "오늘 이걸 끝내자 — PRD 1페이지 작성"
2026-05-30 B = "PRD 1페이지, 60분 만에 깔끔하게 끝낼 수 있을까?"
2026-05-31 A = "오늘 이걸 끝내자 — PRD 1페이지 작성"
2026-06-01 B = "PRD 1페이지, 60분 만에 깔끔하게 끝낼 수 있을까?"

Ask me to reply with the PRD content I wrote and either 완료 or 미완료.
```

[Dashboard Import Hint]
automationType: daily_focus_ab_test
targetDate: YYYY-MM-DD
primaryJson: ab-test-logs.json
relatedJson: reflections.json,evidence-logs.json

---

# 10. Send weekly news summary

enabled: false

```text
Search for major news from the past week: list the top 10 stories in Korea, the top 10 stories in the United States, the top 10 global stories, and 10 new AI-related news items, and prepare a concise summary ready to email to jh104.kim@samsung.com.
```

---

# 11. Check weekly ETF report

enabled: false

```text
Tell me to open and review my weekly ETF/portfolio HTML report generated by the GitHub Action, and summarize key changes.
```

---

# 12. Send weekly investment summary

enabled: false

```text
Tell me the amount I need in each of my accounts to cover the scheduled weekly purchases, include FX conversion for USD, and summarize key news and useful investment info for each asset from the past week.
```
