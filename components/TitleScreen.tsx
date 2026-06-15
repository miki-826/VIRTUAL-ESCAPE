"use client";
import { getBestScore } from "@/lib/storage";
import { useEffect, useState } from "react";

type Props = { onStart: () => void; mockMode: boolean };

export function TitleScreen({ onStart, mockMode }: Props) {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => setBest(getBestScore()), []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden ve-scanlines">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/title-bg.png')" }}
      />
      <div className="absolute inset-0 z-0 ve-grid-bg opacity-40" />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,8,22,0.4) 0%, rgba(5,8,22,0.85) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-4 flex items-center gap-3 text-[10px] tracking-[0.4em] text-[color:var(--accent-bright)]">
          <span className="h-px w-8 bg-[color:var(--accent)]" />
          LOGOUT MANAGER v3.18
          <span className="h-px w-8 bg-[color:var(--accent)]" />
        </div>

        <h1 className="ve-title text-center text-5xl text-[color:var(--text)] sm:text-7xl">
          <span className="block">VIRTUAL</span>
          <span className="block text-[color:var(--accent-bright)]">
            ESCAPE
          </span>
        </h1>

        <p className="mt-6 text-center text-sm leading-relaxed text-[color:var(--text-sub)] sm:text-base">
          残り3分。
          <br />
          声と現実音で、人間であることを証明せよ。
        </p>

        <div className="ve-divider mt-8 w-full max-w-md" />

        <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2 text-center text-[10px] tracking-[0.2em] text-[color:var(--text-sub)] sm:text-xs">
          <div className="ve-frame px-2 py-3">
            <div className="text-[color:var(--accent-bright)]">5</div>
            <div className="mt-1">人間性認証</div>
          </div>
          <div className="ve-frame px-2 py-3">
            <div className="text-[color:var(--accent-bright)]">180s</div>
            <div className="mt-1">制限時間</div>
          </div>
          <div className="ve-frame px-2 py-3">
            <div className="text-[color:var(--accent-bright)]">VOICE</div>
            <div className="mt-1">音声解析</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="ve-title group mt-10 w-full max-w-md cursor-pointer border-2 border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-6 py-4 text-base tracking-[0.3em] text-[color:var(--accent-bright)] transition-all hover:bg-[color:var(--accent)]/25 hover:shadow-[0_0_18px_var(--accent)] focus-visible:bg-[color:var(--accent)]/25 active:translate-y-px sm:text-lg"
        >
          &gt; 認証を開始する
        </button>

        <div className="mt-6 flex flex-col items-center gap-2 text-[10px] tracking-[0.25em] text-[color:var(--text-sub)] sm:text-xs">
          {best != null && best > 0 && (
            <div>BEST SCORE: <span className="text-[color:var(--accent-bright)]">{best}</span></div>
          )}
          {mockMode && <div className="opacity-70">RUNNING IN OFFLINE / MOCK MODE</div>}
        </div>
      </div>
    </div>
  );
}
