"use client";

import { useState } from "react";

interface SyncKeySetupProps {
  onSave: (value: string) => void;
}

export function SyncKeySetup({ onSave }: SyncKeySetupProps) {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-lg font-semibold">Enter Sync Key</h1>
        <p className="text-sm text-[var(--muted)]">
          Use the same key on phone and laptop to sync habit data.
        </p>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. gautam-habits-2026"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={() => value.trim() && onSave(value)}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={!value.trim()}
        >
          Save Sync Key
        </button>
      </div>
    </div>
  );
}
