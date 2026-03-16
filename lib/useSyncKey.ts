"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "habit-sync-key";

export function useSyncKey() {
  const [ready, setReady] = useState(false);
  const [syncKey, setSyncKeyState] = useState<string>("");

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY) ?? "";
    setSyncKeyState(existing);
    setReady(true);
  }, []);

  function setSyncKey(value: string) {
    const next = value.trim();
    localStorage.setItem(STORAGE_KEY, next);
    setSyncKeyState(next);
  }

  function clearSyncKey() {
    localStorage.removeItem(STORAGE_KEY);
    setSyncKeyState("");
  }

  return { ready, syncKey, setSyncKey, clearSyncKey };
}
