import { NextResponse } from "next/server";
import { getEntry, upsertEntry, getSkippedTasks, rebuildTags } from "@/lib/db";
import { extractTags, extractUncheckedTasks } from "@/lib/markdown";

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  const entry = getEntry(date);

  const prevDate = getPreviousDate(date);
  const prevEntry = getEntry(prevDate);
  const skippedTasks = new Set(getSkippedTasks());

  let carryOver: string[] = [];
  if (prevEntry) {
    carryOver = extractUncheckedTasks(prevEntry.content).filter(
      (t) => !skippedTasks.has(t)
    );
  }

  return NextResponse.json({ entry: entry ?? null, carryOver });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const { content } = (await request.json()) as { content: string };

  upsertEntry(date, content);

  const tags = extractTags(content);
  rebuildTags(date, tags);

  return NextResponse.json({ ok: true });
}
