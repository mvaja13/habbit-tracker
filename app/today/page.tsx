"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, format, parseISO, subDays } from "date-fns";
import { HabitCheckbox } from "@/components/HabitCheckbox";
import { Nav } from "@/components/Nav";
import { ScoreCard } from "@/components/ScoreCard";
import { SyncKeySetup } from "@/components/SyncKeySetup";
import { DAILY_HABITS, EXTRA_HABITS } from "@/lib/habits";
import { getRecord, upsertCompletion } from "@/lib/db";
import { calculateDailyScore } from "@/lib/scoring";
import { useSyncKey } from "@/lib/useSyncKey";

function TodayContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = searchParams.get("date");
    return d ? parseISO(d) : new Date();
  });
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { ready, syncKey, setSyncKey, clearSyncKey } = useSyncKey();

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    if (!ready || !syncKey) return;
    let active = true;
    setLoading(true);
    getRecord(syncKey, dateStr)
      .then((record) => {
        if (active) setCompletions(record?.completions ?? {});
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready, syncKey, dateStr]);

  async function handleToggle(habitId: string) {
    if (!syncKey || saving) return;
    const next = !completions[habitId];
    const previous = completions;
    setCompletions((prev) => ({ ...prev, [habitId]: next }));
    setSaving(true);
    try {
      await upsertCompletion(syncKey, dateStr, habitId, next);
    } catch {
      setCompletions(previous);
    } finally {
      setSaving(false);
    }
  }

  const {
    score,
    mainPercent,
    bonusPercent,
    dailyCompleted,
    extraCompleted,
    dailyTotal,
    extraTotal,
  } = calculateDailyScore(completions);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Loading...
      </div>
    );
  }

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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
            >
              ←
            </button>
            <span className="min-w-[140px] text-center font-medium">
              {format(selectedDate, "EEE, MMM d")}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
            >
              →
            </button>
          </div>
        </div>

        <div className="mb-6">
          <ScoreCard
            dailyCompleted={dailyCompleted}
            dailyTotal={dailyTotal}
            extraCompleted={extraCompleted}
            extraTotal={extraTotal}
            mainPercent={mainPercent}
            bonusPercent={bonusPercent}
            scorePercent={score * 100}
          />
        </div>

        {loading ? (
          <div className="text-center text-[var(--muted)]">Loading...</div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                Daily Habits
              </h2>
              <div className="space-y-2">
                {DAILY_HABITS.map((habit) => (
                  <HabitCheckbox
                    key={habit.id}
                    habit={habit}
                    completed={!!completions[habit.id]}
                    onToggle={() => void handleToggle(habit.id)}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                Extra Add-ons
              </h2>
              <div className="space-y-2">
                {EXTRA_HABITS.map((habit) => (
                  <HabitCheckbox
                    key={habit.id}
                    habit={habit}
                    completed={!!completions[habit.id]}
                    onToggle={() => void handleToggle(habit.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
          Loading...
        </div>
      }
    >
      <TodayContent />
    </Suspense>
  );
}
