import { NextResponse } from "next/server";
import { getEntry, updateCheckin } from "@/lib/db";
import { generate, buildPrompt } from "@/lib/ai";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  const entry = getEntry(date);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const wordCount = entry.content.trim()
    ? entry.content.trim().split(/\s+/).length
    : 0;
  if (wordCount < 20) {
    return NextResponse.json(
      { error: "Not enough content" },
      { status: 400 }
    );
  }

  try {
    const result = await generate(buildPrompt("checkin", entry.content));
    updateCheckin(date, result);
    return NextResponse.json({ checkin: result });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
