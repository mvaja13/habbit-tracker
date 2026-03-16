import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { DayRecord } from "@/types";

type RecordsMap = Record<string, Record<string, boolean>>;

const redis = new Redis({
  // Support both Vercel KV-style and Upstash-native env names.
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  token:
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

function getSyncHeader(request: NextRequest): string | null {
  const value = request.headers.get("x-sync-key")?.trim();
  return value ? value : null;
}

function getStoreKey(syncKey: string): string {
  const hashed = createHash("sha256").update(syncKey).digest("hex");
  return `habit-records:${hashed}`;
}

async function loadRecords(syncKey: string): Promise<RecordsMap> {
  const key = getStoreKey(syncKey);
  const map = await redis.get<RecordsMap>(key);
  return map ?? {};
}

async function saveRecords(syncKey: string, map: RecordsMap): Promise<void> {
  const key = getStoreKey(syncKey);
  await redis.set(key, map);
}

export async function GET(request: NextRequest) {
  const syncKey = getSyncHeader(request);
  if (!syncKey) {
    return NextResponse.json(
      { error: "Missing sync key" },
      { status: 400 }
    );
  }

  const params = request.nextUrl.searchParams;
  const date = params.get("date");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");

  const map = await loadRecords(syncKey);

  if (date) {
    const completions = map[date];
    const record: DayRecord | null = completions ? { date, completions } : null;
    return NextResponse.json({ record });
  }

  if (startDate && endDate) {
    const records = Object.keys(map)
      .filter((d) => d >= startDate && d <= endDate)
      .sort((a, b) => a.localeCompare(b))
      .map((d) => ({ date: d, completions: map[d] }));
    return NextResponse.json({ records });
  }

  return NextResponse.json(
    { error: "Provide date or startDate+endDate" },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const syncKey = getSyncHeader(request);
  if (!syncKey) {
    return NextResponse.json(
      { error: "Missing sync key" },
      { status: 400 }
    );
  }

  const body = (await request.json()) as {
    date?: string;
    habitId?: string;
    completed?: boolean;
  };

  if (!body.date || !body.habitId || typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const map = await loadRecords(syncKey);
  const existing = map[body.date] ?? {};
  map[body.date] = { ...existing, [body.habitId]: body.completed };
  await saveRecords(syncKey, map);

  return NextResponse.json({ ok: true });
}
