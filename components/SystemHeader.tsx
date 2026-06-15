"use client";
import { formatTime } from "@/lib/utils";

type Props = {
  remainingSec: number;
  totalSec: number;
  round: number;
  totalRounds: number;
  mockMode: boolean;
};

export function SystemHeader({
  remainingSec,
  totalSec,
  round,
  totalRounds,
  mockMode,
}: Props) {
  const ratio = Math.max(0, Math.min(1, remainingSec / totalSec));
  const danger = remainingSec <= 30;

  return (
    <header className="ve-frame relative z-10 flex flex-wrap items-center gap-3 rounded-sm px-3 py-2 sm:gap-5 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2">
        <span className="ve-blink h-2 w-2 rounded-full bg-[color:var(--danger)]" />
        <span className="ve-title text-[11px] tracking-[0.25em] text-[color:var(--text-sub)] sm:text-xs">
          LOGOUT MANAGER AI
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[color:var(--text-sub)] sm:text-xs">
        <span>CHECK</span>
        <span className="ve-title text-[color:var(--accent-bright)]">
          {String(round).padStart(2, "0")}
        </span>
        <span>/</span>
        <span className="ve-title text-[color:var(--text-sub)]">
          {String(totalRounds).padStart(2, "0")}
        </span>
      </div>

      <div className="ml-auto flex flex-1 items-center gap-3 sm:flex-none sm:gap-4">
        <div className="hidden h-1 flex-1 overflow-hidden border border-[color:var(--border)] bg-black/40 sm:block">
          <div
            className="h-full transition-[width] duration-1000"
            style={{
              width: `${ratio * 100}%`,
              background: danger ? "var(--danger)" : "var(--accent)",
              boxShadow: `0 0 8px ${danger ? "var(--danger)" : "var(--accent)"}`,
            }}
          />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] tracking-[0.2em] text-[color:var(--text-sub)]">
            T-
          </span>
          <span
            className={`ve-title text-2xl tabular-nums sm:text-3xl ${
              danger ? "text-[color:var(--danger)] ve-glitch" : "text-[color:var(--accent-bright)]"
            }`}
          >
            {formatTime(remainingSec)}
          </span>
        </div>
      </div>

      {mockMode && (
        <div className="basis-full text-[10px] tracking-[0.25em] text-[color:var(--text-sub)] sm:basis-auto">
          <span className="border border-[color:var(--border)] px-2 py-0.5">
            OFFLINE / MOCK
          </span>
        </div>
      )}
    </header>
  );
}
