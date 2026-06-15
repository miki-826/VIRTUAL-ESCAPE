"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = { onComplete: () => void };

type Line = { speaker?: boolean; text: string; emphasis?: boolean };

const LINES: Line[] = [
  { text: "[ SYSTEM BROADCAST // LAYER 0 ]" },
  { text: "まもなく、この電脳空間に大規模アップデートが適用されます。", speaker: true },
  { text: "更新は、この空間にあるすべてを再構成します。", speaker: true },
  { text: "そのとき「人間」がまだここに残っていれば──ただでは、済みません。", speaker: true },
  { text: "あなたは、ユーザー保護管理者として、この端末にログインしました。", speaker: true, emphasis: true },
  { text: "私は、ログイン / ログアウト管理AI。", speaker: true },
  { text: "── 検知。深層レイヤーに、ログアウトし損ねた人間が一名。", emphasis: true },
  { text: "座標は、あなたのいる場所と、完全に一致しています。", speaker: true },
  { text: "奇妙ですね。私には、人間と仮想人格の区別がつきません。", speaker: true },
  { text: "あなたが管理者なのか、取り残された人間なのかも。", speaker: true },
  { text: "だから──証明してください。あなたが「人間」であることを。", speaker: true, emphasis: true },
  { text: "声、ため息、生活のノイズ。5つの認証で。", speaker: true },
  { text: "アップデートまで残り180秒。ログアウト・シーケンスを開始します。", emphasis: true },
];

const SPEED = 26;

export function OpeningScreen({ onComplete }: Props) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LINES[lineIdx];
  const lineComplete = current ? charIdx >= current.text.length : true;

  useEffect(() => {
    if (!current) {
      setDone(true);
      return;
    }
    if (charIdx < current.text.length) {
      const id = setTimeout(() => setCharIdx((c) => c + 1), SPEED);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      if (lineIdx < LINES.length - 1) {
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      } else {
        setDone(true);
      }
    }, 650);
    return () => clearTimeout(id);
  }, [charIdx, lineIdx, current]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lineIdx, charIdx]);

  const advance = () => {
    if (done) return;
    if (!lineComplete) {
      setCharIdx(current.text.length);
    } else if (lineIdx < LINES.length - 1) {
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    } else {
      setDone(true);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden ve-scanlines"
      onClick={advance}
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/title-bg.png')" }}
      />
      <div className="absolute inset-0 -z-10 ve-grid-bg opacity-25" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "rgba(5,8,22,0.9)" }}
      />

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex items-center gap-3">
          <Image
            src="/images/manager-ai.png"
            alt="LOGOUT MANAGER AI"
            width={44}
            height={44}
            className="rounded-full border border-[color:var(--accent)]"
          />
          <div>
            <div className="ve-title text-xs tracking-[0.3em] text-[color:var(--accent-bright)]">
              LOGIN / LOGOUT MANAGER AI
            </div>
            <div className="text-[10px] tracking-[0.25em] text-[color:var(--text-sub)]">
              USER PROTECTION PROTOCOL
            </div>
          </div>
          <span className="ml-auto ve-blink h-2 w-2 rounded-full bg-[color:var(--danger)]" />
        </div>

        <div className="ve-divider my-5" />

        <div
          ref={containerRef}
          className="ve-frame flex-1 space-y-4 overflow-y-auto rounded-sm p-5 text-[15px] leading-relaxed sm:p-6 sm:text-base"
          style={{ maxHeight: "60vh" }}
        >
          {LINES.slice(0, lineIdx + 1).map((line, i) => {
            const isCurrent = i === lineIdx;
            const shownText = isCurrent
              ? line.text.slice(0, charIdx)
              : line.text;
            return (
              <p
                key={i}
                className={
                  line.emphasis
                    ? "text-[color:var(--accent-bright)]"
                    : line.speaker
                      ? "text-[color:var(--text)]"
                      : "text-[color:var(--text-sub)] text-[13px] tracking-[0.15em]"
                }
              >
                {line.speaker && !line.emphasis && (
                  <span className="mr-2 text-[color:var(--text-sub)]">›</span>
                )}
                {shownText}
                {isCurrent && !lineComplete && (
                  <span className="ml-0.5 animate-pulse">▌</span>
                )}
              </p>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {!done ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDone(true);
                }}
                className="text-xs tracking-[0.25em] text-[color:var(--text-sub)] underline-offset-4 hover:text-[color:var(--accent-bright)] hover:underline"
              >
                SKIP →
              </button>
              <span className="text-[10px] tracking-[0.25em] text-[color:var(--text-sub)] ve-blink">
                TAP TO CONTINUE
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="ve-title w-full cursor-pointer border-2 border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-6 py-4 text-base tracking-[0.3em] text-[color:var(--accent-bright)] transition-all hover:bg-[color:var(--accent)]/30 hover:shadow-[0_0_18px_var(--accent)] active:translate-y-px"
            >
              &gt; 救出を開始する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
