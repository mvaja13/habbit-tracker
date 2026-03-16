import type { DayRecord } from "@/types";

async function apiGet(path: string, syncKey: string) {
  const response = await fetch(path, {
    headers: { "x-sync-key": syncKey },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function apiPost(path: string, syncKey: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-sync-key": syncKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function getRecord(
  syncKey: string,
  date: string
): Promise<DayRecord | null> {
  const data = await apiGet(
    `/api/records?date=${encodeURIComponent(date)}`,
    syncKey
  );
  return data.record ?? null;
}

export async function upsertCompletion(
  syncKey: string,
  date: string,
  habitId: string,
  completed: boolean
): Promise<void> {
  await apiPost("/api/records", syncKey, { date, habitId, completed });
}

export async function getRecordsForRange(
  syncKey: string,
  startDate: string,
  endDate: string
): Promise<DayRecord[]> {
  const data = await apiGet(
    `/api/records?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    syncKey
  );
  return data.records ?? [];
}
