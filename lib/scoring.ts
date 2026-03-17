import { subDays, format } from "date-fns";
import type { DayRecord } from "@/types";
import { DAILY_HABITS, EXTRA_HABITS } from "./habits";

const DAILY_WEIGHT = 2;
const EXTRA_WEIGHT = 1;
const STREAK_THRESHOLD = 0.8;

const maxDailyPoints = DAILY_HABITS.length * DAILY_WEIGHT;

export function calculateDailyScore(completions: Record<string, boolean>): {
  score: number;
  mainScore: number;
  mainPercent: number;
  bonusPercent: number;
  totalPercent: number;
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
  // Main score uses only compulsory daily habits (0-100%).
  const mainScore = maxDailyPoints > 0 ? dailyPoints / maxDailyPoints : 0;
  const mainPercent = mainScore * 100;
  const extraCompleted = Math.floor(extraPoints / EXTRA_WEIGHT);
  // Extras add bonus points above 100. Each extra completed adds +1%.
  const bonusPercent = extraCompleted;
  const totalPercent = mainPercent + bonusPercent;
  const score = totalPercent / 100;
  return {
    score,
    mainScore,
    mainPercent,
    bonusPercent,
    totalPercent,
    dailyCompleted: Math.floor(dailyPoints / DAILY_WEIGHT),
    extraCompleted,
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
    const { mainScore } = calculateDailyScore(record?.completions ?? {});
    if (mainScore >= STREAK_THRESHOLD) current++;
    else break;
  }
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let running = 0;
  let prevDate = "";
  for (const r of sorted) {
    const { mainScore } = calculateDailyScore(r.completions ?? {});
    const gap = prevDate ? daysBetween(prevDate, r.date) : 1;
    if (mainScore >= STREAK_THRESHOLD) {
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
