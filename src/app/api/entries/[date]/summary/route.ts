import { NextResponse } from "next/server";
import { getEntry, updateSummary } from "@/lib/db";
import { generate, buildPrompt, PROMPTS } from "@/lib/ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  let format: string;
  try {
    const body = (await request.json()) as { format: string };
    format = body.format;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!["standup", "manager", "reflection"].includes(format)) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const entry = getEntry(date);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (!entry.content.trim()) {
    return NextResponse.json({ error: "Entry is empty" }, { status: 400 });
  }

  try {
    const summary = await generate(
      buildPrompt(format as keyof typeof PROMPTS, entry.content)
    );
    updateSummary(date, summary, format);
    return NextResponse.json({ summary, format });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  const entry = getEntry(date);
  if (!entry || !entry.summary_format) {
    return NextResponse.json({ error: "No summary to edit" }, { status: 400 });
  }

  let summary: string;
  try {
    const body = (await request.json()) as { summary: string };
    summary = body.summary;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  updateSummary(date, summary, entry.summary_format);
  return NextResponse.json({ ok: true });
}
