import { Redis } from "@upstash/redis";
import { eachDayOfInterval, format, parseISO } from "date-fns";
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

/** Per-day Redis hash: atomic updates avoid lost writes under concurrent serverless invocations */
function getDayHashKey(syncKey: string, date: string): string {
  const hashed = createHash("sha256").update(syncKey).digest("hex");
  return `habit-day:${hashed}:${date}`;
}

function parseDayHash(entries: Record<string, string>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [habitId, v] of Object.entries(entries)) {
    out[habitId] = v === "1";
  }
  return out;
}

async function loadLegacyRecords(syncKey: string): Promise<RecordsMap> {
  const key = getStoreKey(syncKey);
  const map = await redis.get<RecordsMap>(key);
  return map ?? {};
}

function listDatesInclusive(startDate: string, endDate: string): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (start > end) return [];
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
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

  if (date) {
    const [legacyMap, hashEntries] = await Promise.all([
      loadLegacyRecords(syncKey),
      redis.hgetall<Record<string, string>>(getDayHashKey(syncKey, date)),
    ]);
    const fromHash =
      hashEntries && Object.keys(hashEntries).length > 0 ? parseDayHash(hashEntries) : {};
    const completions = { ...(legacyMap[date] ?? {}), ...fromHash };
    const record: DayRecord | null =
      Object.keys(completions).length > 0 ? { date, completions } : null;
    return NextResponse.json({ record });
  }

  if (startDate && endDate) {
    const legacyMap = await loadLegacyRecords(syncKey);
    const dates = listDatesInclusive(startDate, endDate);

    type HashRow = Record<string, string>;

    let hashRows: HashRow[];
    if (dates.length === 0) {
      hashRows = [];
    } else {
      const pipeline = redis.pipeline();
      for (const d of dates) {
        pipeline.hgetall<HashRow>(getDayHashKey(syncKey, d));
      }
      hashRows = await pipeline.exec();
    }

    const records = dates.flatMap((d, i) => {
      const raw = hashRows[i];
      const fromHash =
        raw && typeof raw === "object" && Object.keys(raw).length > 0
          ? parseDayHash(raw as HashRow)
          : {};
      const completions = { ...(legacyMap[d] ?? {}), ...fromHash };
      return Object.keys(completions).length > 0
        ? [{ date: d, completions }]
        : [];
    });

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

  /** Atomic merge at the field level; avoids losing other habits when concurrent POSTs overlap. */
  await redis.hset(getDayHashKey(syncKey, body.date), {
    [body.habitId]: body.completed ? "1" : "0",
  });

  return NextResponse.json({ ok: true });
}
