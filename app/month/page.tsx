"use client";

import { useEffect, useState } from "react";
import { startOfMonth } from "date-fns";
import { DayGrid } from "@/components/DayGrid";
import { Nav } from "@/components/Nav";
import { SyncKeySetup } from "@/components/SyncKeySetup";
import { getRecordsForRange } from "@/lib/db";
import { useSyncKey } from "@/lib/useSyncKey";
import type { DayRecord } from "@/types";

export default function MonthPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { ready, syncKey, setSyncKey, clearSyncKey } = useSyncKey();

  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  useEffect(() => {
    if (!ready || !syncKey) return;
    let active = true;
    setLoading(true);
    getRecordsForRange(syncKey, startStr, endStr)
      .then((data) => {
        if (active) setRecords(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready, syncKey, startStr, endStr]);

  if (!ready) return null;
  if (!syncKey) return <SyncKeySetup onSave={setSyncKey} />;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Habit Builder</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSyncKey}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Change Key
            </button>
            <Nav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <div className="text-center text-[var(--muted)]">Loading...</div>
        ) : (
          <DayGrid month={month} records={records} onMonthChange={setMonth} />
        )}
      </main>
    </div>
  );
}
