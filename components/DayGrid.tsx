"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import Link from "next/link";
import type { DayRecord } from "@/types";
import { calculateDailyScore } from "@/lib/scoring";

interface DayGridProps {
  month: Date;
  records: DayRecord[];
  onMonthChange: (month: Date) => void;
}

export function DayGrid({ month, records, onMonthChange }: DayGridProps) {
  const byDate = new Map(records.map((r) => [r.date, r]));
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const padStart = start.getDay();
  const padEnd = 6 - end.getDay();
  const paddedDays = [...Array(padStart).fill(null), ...days, ...Array(padEnd).fill(null)];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--muted)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} className="aspect-square" />;
          const dateStr = format(day, "yyyy-MM-dd");
          const record = byDate.get(dateStr);
          const { score } = calculateDailyScore(record?.completions ?? {});
          const qualified = score >= 0.8;
          return (
            <Link
              key={dateStr}
              href={`/today?date=${dateStr}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-colors ${
                qualified ? "bg-[var(--success)]/20 text-[var(--success)]" : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--border)]"
              }`}
            >
              {format(day, "d")}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
