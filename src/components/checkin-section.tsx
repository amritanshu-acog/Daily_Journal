"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CheckinSection({
  date,
  initialCheckin,
}: {
  date: string;
  initialCheckin: string | null;
}) {
  const [checkin, setCheckin] = useState<string | null>(initialCheckin);
  const [isOpen, setIsOpen] = useState(initialCheckin !== null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const hasRun = checkin !== null;

  const handleCheckin = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/entries/${date}/checkin`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { checkin: string };
      setCheckin(data.checkin);
      setIsOpen(true);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-b px-4 py-3">
      <button
        type="button"
        onClick={handleCheckin}
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Checking in…
          </>
        ) : hasRun ? (
          "\u21BA Refresh Check-in"
        ) : (
          "\u2600\uFE0F Mid-day Check-in"
        )}
      </button>

      {status === "error" && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Check-in failed —{" "}
          <button
            type="button"
            onClick={handleCheckin}
            className="underline hover:no-underline"
          >
            Retry
          </button>
        </p>
      )}

      {checkin && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            <span>{isOpen ? "\u25BE" : "\u25B8"}</span>
            Today&apos;s priorities
          </button>
          {isOpen && (
            <div className="prose dark:prose-invert mt-2 max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {checkin}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
