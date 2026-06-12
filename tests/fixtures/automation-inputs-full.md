# ChatGPT 자동화 입력 원문 모음 - Bulk Import Test

생성일: 2026-06-12
용도: fenced code 안의 Markdown 제목을 block 시작으로 오인하지 않는지 검증한다.

---

# 1. Oflow Morning Brief

automationType: oflow_morning_brief

```text
최종 Markdown 형식:
# Oflow Morning Brief - YYYY-MM-DD

## 오늘의 핵심 목표
-

## 오늘 첫 행동
-
```

[Dashboard Import Hint]
automationType: oflow_morning_brief
targetDate: YYYY-MM-DD
primaryJson: daily-focus-plans.json
relatedJson: brief-logs.json,evidence-logs.json

---

# 2. AI 교육 집중 계획

automationType: ai_education_focus

```text
응답 형식:
# AI Education Focus Dashboard - YYYY-MM-DD

## 1. 오늘의 핵심 목표
- 오늘 가장 중요한 목표 1개

## 4. AI/AX 적용 관점
- 내 업무 문제:
- AI로 바꿀 수 있는 형태:
- 필요한 기술:
```

[Dashboard Import Hint]
automationType: ai_education_focus
targetDate: YYYY-MM-DD
primaryJson: daily-focus-plans.json
relatedJson: learning-modules.json,ai-applications.json,evidence-logs.json

---

# 3. Evening Reflection

automationType: evening_reflection

```text
## 저녁 회고

### 1) 오늘 아침 핵심 목표 확인
### 2) 오늘 완료한 것
### 3) 아쉬웠던 점 또는 막힌 점
```

[Dashboard Import Hint]
automationType: evening_reflection
targetDate: YYYY-MM-DD
primaryJson: reflections.json
relatedJson: evidence-logs.json,daily-focus-plans.json

---

# 4. Daily Focus A/B 카드

automationType: daily_focus_ab_test
오늘의 문구:
- 오늘의 실행 문구

[Dashboard Import Hint]
automationType: daily_focus_ab_test
targetDate: YYYY-MM-DD
primaryJson: ab-test-logs.json
relatedJson: reflections.json,evidence-logs.json

---

# 5. AI Framework Check

automationType: ai_framework_check
오늘의 주제:
- RAG 평가 기준
30초 체크 질문:
- 근거와 답변이 연결되는가?

[Dashboard Import Hint]
automationType: ai_framework_check
targetDate: YYYY-MM-DD
primaryJson: ai-framework-checks.json
relatedJson: learning-modules.json,evidence-logs.json

---

# 6. 야리가다케산장 예약

automationType: reminder_task
예약 제목:
- 야리가다케산장 예약
예약 사이트:
- https://example.com/yari
예약 오픈 시간:
- 09:00

[Dashboard Import Hint]
automationType: reminder_task
targetDate: 2026-07-08
primaryJson: reminder-tasks.json
relatedJson: evidence-logs.json

---

# 7. 야리사와산장 예약

automationType: reminder_task
예약 제목:
- 야리사와산장 예약
예약 사이트:
- https://example.com/yarisawa
예약 오픈 시간:
- 09:00

[Dashboard Import Hint]
automationType: reminder_task
targetDate: 2026-07-07
primaryJson: reminder-tasks.json
relatedJson: evidence-logs.json

---

# 8. Daily Check Brief

automationType: oflow_morning_brief

```text
# Daily Check + Life OS Brief - YYYY-MM-DD

## 오늘의 핵심 목표
-
```

[Dashboard Import Hint]
automationType: oflow_morning_brief
targetDate: YYYY-MM-DD
primaryJson: daily-focus-plans.json
relatedJson: brief-logs.json,evidence-logs.json

---

# 9. 실행해 Daily Focus A/B 테스트

automationType: daily_focus_ab_test
오늘의 문구:
- 실행해

[Dashboard Import Hint]
automationType: daily_focus_ab_test
targetDate: YYYY-MM-DD
primaryJson: ab-test-logs.json
relatedJson: reflections.json,evidence-logs.json

---

# 10. Send weekly news summary

This weekly news automation is intentionally unsupported by dashboard import.

---

# 11. Check weekly ETF report

This ETF report automation is intentionally unsupported by dashboard import.

---

# 12. Send weekly investment summary

This weekly investment summary automation is intentionally unsupported by dashboard import.
