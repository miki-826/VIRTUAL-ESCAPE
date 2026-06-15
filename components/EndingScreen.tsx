"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Props = { success: boolean; rank: string; onRetry: () => void };

const SUCCESS_LINES = [
  "[ LOGOUT SEQUENCE COMPLETE ]",
  "認証を通過。人間性、確認しました。",
  "ゲートが開きます。更新の波は、すぐ後ろまで来ています。",
  "接続を、現実へ切り替えます──",
  "キーボードの感触。コーヒーの匂い。雑然とした生活の音。",
  "おかえりなさい。あなたは、確かに人間でした。",
  "[ HUMAN SAFELY LOGGED OUT ]",
];

const FAIL_LINES = [
  "[ AUTHENTICATION FAILED ]",
  "人間性を、十分に確認できませんでした。",
  "あなたの反応は……少し、整いすぎている。",
  "更新プロセスが開始されます。空間が白く塗り替えられていく。",
  "まだ間に合う。もう一度。もっと雑に、もっと人間らしく。",
  "[ RE-AUTHENTICATION REQUIRED ]",
];

export function EndingScreen({ success, rank, onRetry }: Props) {
  const lines = success ? SUCCESS_LINES : FAIL_LINES;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= lines.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 900);
    return () => clearTimeout(id);
  }, [shown, lines.length]);

  const finished = shown >= lines.length;
  const accent = success ? "var(--success)" : "var(--danger)";

  return (
    <div className="relative min-h-screen overflow-hidden ve-scanlines">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: success
            ? "url('/images/result-bg.png')"
            : "url('/images/game-bg.png')",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: success
            ? "radial-gradient(circle at 50% 45%, rgba(52,211,153,0.12), rgba(5,8,22,0.92) 70%)"
            : "rgba(5,8,22,0.92)",
        }}
      />
      {success && (
        <div
          className="ve-scan-sweep absolute inset-x-0 -z-10 h-1/3 opacity-40"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(52,211,153,0.25), transparent)",
          }}
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
        <Image
          src="/images/manager-ai.png"
          alt="LOGOUT MANAGER AI"
          width={64}
          height={64}
          className="mb-6 rounded-full border"
          style={{ borderColor: accent }}
        />

        <h2
          className={`ve-title text-3xl sm:text-4xl ${success ? "" : "ve-glitch"}`}
          style={{ color: accent }}
        >
          {success ? "ESCAPED" : "TRAPPED"}
        </h2>
        <div className="mt-1 text-[10px] tracking-[0.4em] text-[color:var(--text-sub)]">
          {success ? "現実への帰還" : "電脳空間に残留"} / RANK {rank}
        </div>

        <div className="ve-divider my-7 w-full max-w-md" />

        <div className="min-h-[220px] w-full max-w-md space-y-3">
          {lines.slice(0, shown).map((line, i) => {
            const bracket = line.startsWith("[");
            return (
              <p
                key={i}
                className={`transition-opacity duration-700 ${
                  bracket
                    ? "ve-title text-xs tracking-[0.25em]"
                    : "text-[15px] leading-relaxed text-[color:var(--text)]"
                }`}
                style={bracket ? { color: accent } : undefined}
              >
                {line}
              </p>
            );
          })}
          {!finished && (
            <span className="inline-block animate-pulse text-[color:var(--text-sub)]">
              ▌
            </span>
          )}
        </div>

        <div className="mt-8 flex h-14 w-full max-w-md items-center justify-center">
          {finished && (
            <button
              type="button"
              onClick={onRetry}
              className="ve-title w-full cursor-pointer border-2 px-6 py-4 text-base tracking-[0.3em] transition-all active:translate-y-px"
              style={{
                borderColor: accent,
                color: accent,
                background: success
                  ? "rgba(52,211,153,0.12)"
                  : "rgba(239,68,68,0.12)",
              }}
            >
              {success ? "> もう一度、誰かを救出する" : "> もう一度、救出に挑む"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
