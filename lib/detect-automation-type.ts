import { parseDashboardImportHint } from "./dashboard-import-hint";
import type { AutomationType } from "./types";

export function detectAutomationType(text: string): AutomationType {
  const hinted = parseDashboardImportHint(text).automationType;
  if (hinted) {
    return hinted;
  }

  const normalized = normalize(text);

  if (
    normalized.includes("oflowmorningbrief") ||
    (normalized.includes("gmail핵심요약") && normalized.includes("slack확인필요항목"))
  ) {
    return "oflow_morning_brief";
  }

  if (
    normalized.includes("aieducationfocusdashboard") ||
    (normalized.includes("ai/ax적용관점") && normalized.includes("codex/claudecode입력용"))
  ) {
    return "ai_education_focus";
  }

  if (
    normalized.includes("dailyoperationlog") ||
    normalized.includes("운영기록") ||
    (normalized.includes("오늘완료한것") && normalized.includes("산출물로그"))
  ) {
    return "daily_operation_log";
  }

  if (
    normalized.includes("저녁회고") ||
    (normalized.includes("오늘아침핵심목표확인") &&
      normalized.includes("내일핵심목표초안"))
  ) {
    return "evening_reflection";
  }

  if (
    normalized.includes("실험variant") ||
    (normalized.includes("오늘의문구") && normalized.includes("내판단기준"))
  ) {
    return "daily_focus_ab_test";
  }

  if (
    normalized.includes("30초체크질문") ||
    (normalized.includes("안다") && normalized.includes("모른다") && normalized.includes("핵심포인트"))
  ) {
    return "ai_framework_check";
  }

  if (
    normalized.includes("예약오픈시간") ||
    (normalized.includes("예약대상") && normalized.includes("예약사이트")) ||
    normalized.includes("즉시접속")
  ) {
    return "reminder_task";
  }

  if (
    normalized.includes("weeklynewssummary") ||
    normalized.includes("주간뉴스요약") ||
    (normalized.includes("한국뉴스") && normalized.includes("ai뉴스"))
  ) {
    return "weekly_news_summary";
  }

  if (
    normalized.includes("weeklyetfreport") ||
    normalized.includes("etf리포트") ||
    normalized.includes("etf/포트폴리오리포트")
  ) {
    return "weekly_etf_report_check";
  }

  if (
    normalized.includes("weeklyinvestmentsummary") ||
    normalized.includes("주간투자요약") ||
    normalized.includes("계좌별필요금액")
  ) {
    return "weekly_investment_summary";
  }

  if (
    normalized.includes("dailyfocusupdate") ||
    normalized.includes("진행률업데이트") ||
    normalized.includes("reviewnotes") ||
    normalized.includes("blockedreason") ||
    normalized.includes("nextaction") ||
    (normalized.includes("firstactiondone") && normalized.includes("completionchecked"))
  ) {
    return "daily_focus_update";
  }

  return "unknown";
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}
