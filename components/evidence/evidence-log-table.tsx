"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/dashboard-utils";
import type { EvidenceLog, EvidenceType } from "@/lib/types";

interface EvidenceLogTableProps {
  logs: EvidenceLog[];
}

const filters: Array<EvidenceType | "전체"> = ["전체", "문서", "코드", "대시보드", "회고"];

export function EvidenceLogTable({ logs }: EvidenceLogTableProps) {
  const [filter, setFilter] = useState<EvidenceType | "전체">("전체");
  const filteredLogs =
    filter === "전체" ? logs : logs.filter((log) => log.outputType === filter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              filter === item
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">산출물명</th>
                <th className="px-4 py-3">타입</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">관련 목표</th>
                <th className="px-4 py-3">관련 모듈</th>
                <th className="px-4 py-3">날짜</th>
                <th className="px-4 py-3">링크 / 저장 후보</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr id={log.id} key={log.id} className="align-top">
                  <td className="min-w-72 px-4 py-4">
                    <div className="font-semibold text-slate-950">{log.title}</div>
                    <div className="mt-1 leading-5 text-slate-600">{log.description}</div>
                    <div className="mt-2 text-xs text-slate-500">{log.note}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
                      {log.outputType}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-4">
                    {log.relatedGoalId ? (
                      <Link
                        href={`/goals#${log.relatedGoalId}`}
                        className="font-medium text-cyan-700 underline decoration-cyan-200 underline-offset-4"
                      >
                        {log.relatedGoalId}
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    {log.relatedModuleId ? (
                      <Link
                        href={`/learning#${log.relatedModuleId}`}
                        className="font-medium text-cyan-700 underline decoration-cyan-200 underline-offset-4"
                      >
                        {log.relatedModuleId}
                      </Link>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-slate-600">
                    {formatDate(log.targetDate)}
                  </td>
                  <td className="min-w-72 px-4 py-4">
                    <Link
                      href={log.artifactLink}
                      className="font-medium text-cyan-700 underline decoration-cyan-200 underline-offset-4"
                    >
                      열기
                    </Link>
                    <div className="mt-2 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 font-mono text-xs text-violet-700">
                      Obsidian: {log.obsidianCandidatePath}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
