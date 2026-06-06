import { NextResponse } from "next/server";
import { skipTask } from "@/lib/db";

export async function POST(request: Request) {
  const { taskText } = (await request.json()) as { taskText: string };
  skipTask(taskText);
  return NextResponse.json({ ok: true });
}
