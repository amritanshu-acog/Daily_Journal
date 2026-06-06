import { NextResponse } from "next/server";
import { getAllEntryDates, getTagsForDate } from "@/lib/db";

export async function GET() {
  const dates = getAllEntryDates();
  const result = dates.map((d) => ({
    date: d.date,
    hasSummary: d.hasSummary,
    tags: getTagsForDate(d.date),
  }));
  return NextResponse.json({ dates: result });
}
