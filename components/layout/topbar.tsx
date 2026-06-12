"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dataSourceStatus } from "@/lib/mock-data";

const pageTitles: Record<string, string> = {
  "/": "Home Dashboard",
  "/focus": "Daily Focus Plan",
  "/goals": "Goal Management",
  "/ai-ax": "AI/AX Application",
  "/learning": "Learning / Skill Map",
  "/reflection": "Evening Reflection",
  "/evidence": "Evidence / Output Log",
  "/import": "Import",
  "/automation": "Automation Roadmap",
};

const menuItems = Object.entries(pageTitles);

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Daily Focus Dashboard";
  const readyCount = dataSourceStatus.filter((source) => source.automationReady).length;
  const today = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-6">
        <div>
          <div className="text-sm text-slate-500">{today}</div>
          <div className="text-lg font-semibold text-slate-950">{title}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
            mock data
          </span>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
            automation ready {readyCount}/{dataSourceStatus.length}
          </span>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
        {menuItems.map(([href, label]) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium ${
                active
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
