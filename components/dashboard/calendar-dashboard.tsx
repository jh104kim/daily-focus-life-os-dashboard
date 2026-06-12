"use client";

import { useEffect, useMemo, useState } from "react";
import { ImportDialog } from "@/components/import/import-dialog";
import {
  getDailyFocusByDate,
  getDailyOperationStatus,
  getDailySummary,
  getDateKey,
  getEvidenceLogsByDate,
  getMonthKey,
  getMonthlySummary,
  getReflectionByDate,
  getWeekKey,
  getWeeklySummary,
} from "@/lib/dashboard-utils";
import type { DashboardData } from "@/lib/types";
import { DailyOperationStatus } from "./daily-operation-status";
import { AutomationLogSummary } from "./automation-log-summary";
import { DailySummary } from "./daily-summary";
import { MonthlySummary } from "./monthly-summary";
import { WeeklyAutomationSummary } from "./weekly-automation-summary";
import { WeeklySummary } from "./weekly-summary";

interface CalendarDashboardProps {
  initialData: DashboardData;
}

export function CalendarDashboard({ initialData }: CalendarDashboardProps) {
  const [data, setData] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState(getDateKey(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(getMonthKey(new Date()));
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    void refreshData();
  }, []);

  const weekly = useMemo(() => getWeeklySummary(selectedDate, data), [selectedDate, data]);
  const weekKey = useMemo(() => getWeekKey(selectedDate), [selectedDate]);
  const monthly = useMemo(() => getMonthlySummary(selectedDate, data), [selectedDate, data]);
  const operation = useMemo(
    () => getDailyOperationStatus(selectedDate, data),
    [selectedDate, data],
  );
  const daySummary = useMemo(() => getDailySummary(selectedDate, data), [selectedDate, data]);
  const dailyFocus = getDailyFocusByDate(selectedDate, data.dailyFocusPlans);
  const selectedAi = data.aiApplications.filter((item) => getDateKey(item.targetDate) === selectedDate);
  const selectedEvidence = getEvidenceLogsByDate(selectedDate, data.evidenceLogs);
  const selectedReflection = getReflectionByDate(selectedDate, data.reflections);
  const selectedBriefLogs = data.briefLogs.filter(
    (item) => getDateKey(item.briefDate ?? item.targetDate) === selectedDate,
  );
  const selectedAbTestLogs = data.abTestLogs.filter(
    (item) => getDateKey(item.testDate ?? item.targetDate) === selectedDate,
  );
  const selectedFrameworkChecks = data.aiFrameworkChecks.filter(
    (item) => getDateKey(item.checkDate ?? item.targetDate) === selectedDate,
  );
  const selectedReminderTasks = data.reminderTasks.filter(
    (item) => getDateKey(item.reminderDate ?? item.targetDate) === selectedDate,
  );

  const selectedLearning = data.learningModules.filter(
    (module) => module.id === dailyFocus?.relatedModuleId || module.focusToday,
  );

  async function refreshData(nextDate?: string) {
    const response = await fetch("/api/today", { cache: "no-store" });
    const latest = (await response.json()) as DashboardData;
    setData(latest);
    if (nextDate) {
      setSelectedDate(nextDate);
      setVisibleMonth(getMonthKey(nextDate));
    }
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setVisibleMonth(getMonthKey(date));
  }

  function handleImportSaved(targetDate: string) {
    setImportOpen(false);
    void refreshData(targetDate || selectedDate);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">운영 캘린더</h2>
              <p className="mt-1 text-sm text-slate-500">날짜를 선택해 일/주/月 상태를 봅니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              자동화 결과 Import
            </button>
          </div>
          <Calendar
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            focusDates={data.dailyFocusPlans.map((item) => item.selectedDate ?? item.targetDate)}
            onMonthChange={setVisibleMonth}
            onDateSelect={handleDateSelect}
          />
        </div>
        <WeeklySummary
          range={{ start: weekly.start, end: weekly.end }}
          goalCount={weekly.goalCount}
          doneCount={weekly.doneCount}
          blockedCount={weekly.blockedCount}
          evidenceCount={weekly.weeklyEvidence.length}
          reflectionCount={weekly.weeklyReflections.length}
          averageProgress={weekly.averageProgress}
          weeklyFocus={weekly.weeklyFocus}
          weeklyGoals={weekly.weeklyGoals}
        />
      </section>

      <WeeklyAutomationSummary
        selectedDate={selectedDate}
        weekKey={weekKey}
        newsSummaries={data.weeklyNewsSummaries}
        investmentReports={data.investmentReportLogs}
        investmentSummaries={data.investmentSummaryLogs}
      />

      <DailyOperationStatus
        selectedDate={selectedDate}
        operation={operation}
        summary={daySummary}
      />

      <DailySummary
        selectedDate={selectedDate}
        focus={dailyFocus}
        aiApplications={selectedAi}
        learningModules={selectedLearning}
        evidenceLogs={selectedEvidence}
        reflection={selectedReflection}
      />

      <AutomationLogSummary
        briefLogs={selectedBriefLogs}
        abTestLogs={selectedAbTestLogs}
        aiFrameworkChecks={selectedFrameworkChecks}
        reminderTasks={selectedReminderTasks}
        evidenceLogs={selectedEvidence}
      />

      <MonthlySummary
        monthKey={monthly.monthKey}
        goalCount={monthly.goalCount}
        doneCount={monthly.doneCount}
        blockedCount={monthly.blockedCount}
        averageProgress={monthly.averageProgress}
        monthlyGoals={monthly.monthlyGoals}
        monthlyFocus={monthly.monthlyFocus}
        monthlyEvidence={monthly.monthlyEvidence}
        monthlyReflections={monthly.monthlyReflections}
        monthlyAi={monthly.monthlyAi}
        activeLearning={monthly.activeLearning}
      />

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSaved={handleImportSaved}
      />
    </div>
  );
}

function Calendar({
  visibleMonth,
  selectedDate,
  focusDates,
  onMonthChange,
  onDateSelect,
}: {
  visibleMonth: string;
  selectedDate: string;
  focusDates: string[];
  onMonthChange: (monthKey: string) => void;
  onDateSelect: (date: string) => void;
}) {
  const focusDateSet = new Set(focusDates.map((date) => getDateKey(date)));
  const days = getCalendarDays(visibleMonth);
  const monthLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(new Date(`${visibleMonth}-01T00:00:00`));

  function moveMonth(offset: number) {
    const next = new Date(`${visibleMonth}-01T00:00:00`);
    next.setMonth(next.getMonth() + offset);
    onMonthChange(getMonthKey(next));
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          이전
        </button>
        <div className="font-semibold text-slate-950">{monthLabel}</div>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          다음
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const active = day.date === selectedDate;
          const hasFocus = focusDateSet.has(day.date);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onDateSelect(day.date)}
              className={`relative min-h-12 rounded-md border p-2 text-left text-sm ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : day.inMonth
                    ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    : "border-slate-100 bg-slate-50 text-slate-400"
              }`}
            >
              <span className="font-mono">{Number(day.date.slice(-2))}</span>
              {hasFocus ? (
                <span
                  className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                    active ? "bg-cyan-300" : "bg-cyan-600"
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getCalendarDays(monthKey: string) {
  const first = new Date(`${monthKey}-01T00:00:00`);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days: Array<{ date: string; inMonth: boolean }> = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const date = getDateKey(current);
    days.push({ date, inMonth: getMonthKey(date) === monthKey });
  }

  return days;
}
