"use client";

import type { Habit } from "@/types";

interface HabitCheckboxProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}

export function HabitCheckbox({ habit, completed, onToggle }: HabitCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition-colors hover:border-[var(--muted)] active:scale-[0.99]"
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          completed
            ? "border-[var(--success)] bg-[var(--success)] text-white"
            : "border-[var(--border)] bg-transparent"
        }`}
      >
        {completed && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={`text-base ${completed ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
        {habit.name}
      </span>
    </button>
  );
}
