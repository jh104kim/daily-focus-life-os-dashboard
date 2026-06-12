"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "Home Dashboard" },
  { href: "/focus", label: "Daily Focus Plan" },
  { href: "/goals", label: "Goal Management" },
  { href: "/ai-ax", label: "AI/AX Application" },
  { href: "/learning", label: "Learning / Skill Map" },
  { href: "/reflection", label: "Evening Reflection" },
  { href: "/evidence", label: "Evidence / Output Log" },
  { href: "/import", label: "Import" },
  { href: "/automation", label: "Automation Roadmap" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-200 p-5">
          <div className="text-lg font-semibold text-slate-950">Life OS</div>
          <div className="mt-1 text-sm text-slate-500">Daily Focus Dashboard</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                  active
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500">
          지금은 mock data로만 동작합니다. DB, Supabase, 외부 API 연결은 없습니다.
        </div>
      </div>
    </aside>
  );
}
