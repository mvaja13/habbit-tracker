"use client";

interface ScoreCardProps {
  dailyCompleted: number;
  dailyTotal: number;
  extraCompleted: number;
  extraTotal: number;
  scorePercent: number;
}

export function ScoreCard({
  dailyCompleted,
  dailyTotal,
  extraCompleted,
  extraTotal,
  scorePercent,
}: ScoreCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-[var(--muted)]">
          {dailyCompleted}/{dailyTotal} daily + {extraCompleted}/{extraTotal} extra
        </div>
        <div
          className={`text-lg font-semibold ${
            scorePercent >= 80 ? "text-[var(--success)]" : scorePercent >= 50 ? "text-[var(--foreground)]" : "text-[var(--danger)]"
          }`}
        >
          {Math.round(scorePercent)}%
        </div>
      </div>
    </div>
  );
}
