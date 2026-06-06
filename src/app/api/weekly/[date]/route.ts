import { NextResponse } from "next/server";
import { getWeeklyDigest, getEntriesForWeek, upsertWeeklyDigest, getEntry } from "@/lib/db";
import { getMondayOfWeek, getWeekDays } from "@/lib/dates";
import { generate, buildPrompt } from "@/lib/ai";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const weekStart = getMondayOfWeek(date);
  const digest = getWeeklyDigest(weekStart);
  const weekDays = getWeekDays(weekStart);
  const days = weekDays.map((d) => ({
    date: d,
    hasEntry: (getEntry(d)?.content.trim().length ?? 0) > 0,
  }));

  return NextResponse.json({
    weekStart,
    digest: digest?.content ?? null,
    days,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const weekStart = getMondayOfWeek(date);
  const entries = getEntriesForWeek(weekStart);

  const entriesWithContent = entries.filter(
    (e) => e.content.trim().length > 0
  );

  if (entriesWithContent.length < 2) {
    return NextResponse.json(
      { error: "Not enough entries" },
      { status: 400 }
    );
  }

  const combined = entriesWithContent
    .map((e) => `=== ${e.date} ===\n${e.content}`)
    .join("\n\n");

  const result = await generate(buildPrompt("weekly", combined));
  upsertWeeklyDigest(weekStart, result);

  return NextResponse.json({ digest: result });
}
