"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { Nav } from "@/components/Nav";
import { SyncKeySetup } from "@/components/SyncKeySetup";
import { getRecordsForRange } from "@/lib/db";
import { calculateDailyScore, getStreak } from "@/lib/scoring";
import { useSyncKey } from "@/lib/useSyncKey";
import type { DayRecord } from "@/types";

export default function ScoresPage() {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { ready, syncKey, setSyncKey, clearSyncKey } = useSyncKey();

  const end = new Date();
  const start = subDays(end, 30);
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

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

  const { current, best } = useMemo(() => getStreak(records), [records]);
  const last7 = useMemo(
    () =>
      [...records]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7)
        .reverse(),
    [records]
  );
  const avg30 = useMemo(() => {
    if (records.length === 0) return 0;
    return (
      records.reduce(
        (acc, r) => acc + calculateDailyScore(r.completions ?? {}).score * 100,
        0
      ) / records.length
    );
  }, [records]);

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
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                Streaks
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="text-2xl font-bold text-[var(--success)]">
                    {current}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    Current streak (days)
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="text-2xl font-bold">{best}</div>
                  <div className="text-sm text-[var(--muted)]">
                    Best streak (days)
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                Last 7 days
              </h2>
              {last7.length === 0 ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-8 text-center text-sm text-[var(--muted)]">
                  No data yet. Start tracking on the Today page.
                </div>
              ) : (
                <div className="flex items-end gap-2" style={{ height: "120px" }}>
                  {last7.map((r) => {
                    const { score } = calculateDailyScore(r.completions ?? {});
                    const pct = Math.round(score * 100);
                    return (
                      <div
                        key={r.date}
                        className="flex flex-1 flex-col items-center justify-end gap-1"
                      >
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${Math.max(4, (pct / 100) * 100)}px`,
                            backgroundColor:
                              pct >= 80 ? "var(--success)" : "var(--surface)",
                          }}
                        />
                        <span className="text-xs text-[var(--muted)]">
                          {format(new Date(r.date), "EEE")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                30-day average
              </h2>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="text-2xl font-bold">
                  {records.length > 0 ? Math.round(avg30) : 0}%
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Based on {records.length} day
                  {records.length !== 1 ? "s" : ""} of data
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
