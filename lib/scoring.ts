import { subDays, format } from "date-fns";
import type { DayRecord } from "@/types";
import { DAILY_HABITS, EXTRA_HABITS } from "./habits";

const DAILY_WEIGHT = 2;
const EXTRA_WEIGHT = 1;
const STREAK_THRESHOLD = 0.8;

const maxDailyPoints = DAILY_HABITS.length * DAILY_WEIGHT;
const maxExtraPoints = EXTRA_HABITS.length * EXTRA_WEIGHT;
const maxTotalPoints = maxDailyPoints + maxExtraPoints;

export function calculateDailyScore(completions: Record<string, boolean>): {
  score: number;
  dailyCompleted: number;
  extraCompleted: number;
  dailyTotal: number;
  extraTotal: number;
} {
  let dailyPoints = 0;
  let extraPoints = 0;
  DAILY_HABITS.forEach((h) => {
    if (completions[h.id]) dailyPoints += DAILY_WEIGHT;
  });
  EXTRA_HABITS.forEach((h) => {
    if (completions[h.id]) extraPoints += EXTRA_WEIGHT;
  });
  const score = maxTotalPoints > 0 ? (dailyPoints + extraPoints) / maxTotalPoints : 0;
  return {
    score,
    dailyCompleted: Math.floor(dailyPoints / DAILY_WEIGHT),
    extraCompleted: Math.floor(extraPoints / EXTRA_WEIGHT),
    dailyTotal: DAILY_HABITS.length,
    extraTotal: EXTRA_HABITS.length,
  };
}

export function getStreak(records: DayRecord[]): { current: number; best: number } {
  const byDate = new Map(records.map((r) => [r.date, r]));
  let current = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    const date = format(d, "yyyy-MM-dd");
    const record = byDate.get(date);
    const { score } = calculateDailyScore(record?.completions ?? {});
    if (score >= STREAK_THRESHOLD) current++;
    else break;
  }
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let running = 0;
  let prevDate = "";
  for (const r of sorted) {
    const { score } = calculateDailyScore(r.completions ?? {});
    const gap = prevDate ? daysBetween(prevDate, r.date) : 1;
    if (score >= STREAK_THRESHOLD) {
      running = gap === 1 ? running + 1 : 1;
      best = Math.max(best, running);
    } else running = 0;
    prevDate = r.date;
  }
  return { current, best };
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 60 * 60 * 1000));
}
