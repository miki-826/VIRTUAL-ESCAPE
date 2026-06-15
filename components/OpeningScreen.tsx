"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSpeech } from "@/hooks/useSpeech";

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

// 音声OFF/非対応時の読みやすいタイプ速度（ミリ秒/文字）
const TYPE_SPEED = 60;
const TAG_SPEED = 24;
// 読み上げで境界イベントが来ない場合の概算ペース
const VOICE_FALLBACK_SPEED = 115;

export function OpeningScreen({ onComplete }: Props) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [lineDone, setLineDone] = useState(false);
  const [done, setDone] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { supported: voiceSupported, speak, cancel } = useSpeech();

  const current = LINES[lineIdx];

  // 行ごとのライフサイクル：文字を（音声に同期して）出し、終わったらクリック待ち。
  // 自動では絶対に次へ進まない＝読み上げが途中で打ち切られない。
  useEffect(() => {
    if (done || !current) return;
    const fullText = current.text;
    const spoken = fullText.replace(/──/g, "、");
    const isTag = fullText.startsWith("[");
    setCharIdx(0);
    setLineDone(false);

    let cancelled = false;
    let boundaryFired = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let probeId: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (intervalId) clearInterval(intervalId);
      if (probeId) clearTimeout(probeId);
      intervalId = null;
      probeId = null;
    };

    const finishLine = () => {
      if (cancelled) return;
      clearTimers();
      setCharIdx(fullText.length);
      setLineDone(true);
      setSpeaking(false);
    };

    const runTypewriter = (perChar: number, markDone: boolean) => {
      intervalId = setInterval(() => {
        setCharIdx((c) => {
          if (c >= fullText.length) {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
            if (markDone) setLineDone(true);
            return c;
          }
          return c + 1;
        });
      }, perChar);
    };

    if (voiceOn && voiceSupported && !isTag) {
      setSpeaking(true);
      speak(spoken, {
        onBoundary: (ci, len) => {
          boundaryFired = true;
          clearTimers();
          setCharIdx(Math.min(fullText.length, ci + (len || 1)));
        },
        onEnd: finishLine,
      });
      // 境界イベントが来ないブラウザ向けに、来なければ概算ペースで文字送り
      probeId = setTimeout(() => {
        if (!cancelled && !boundaryFired && intervalId == null) {
          runTypewriter(VOICE_FALLBACK_SPEED, false);
        }
      }, 450);
    } else {
      runTypewriter(isTag ? TAG_SPEED : TYPE_SPEED, true);
    }

    return () => {
      cancelled = true;
      clearTimers();
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, voiceOn]);

  useEffect(() => {
    if (done) {
      cancel();
      setSpeaking(false);
    }
  }, [done, cancel]);

  useEffect(() => () => cancel(), [cancel]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lineIdx, charIdx]);

  // クリックでのみ進行。未完了ならまず行を完了（読み上げ・タイプをスキップ）、完了済みなら次行へ。
  const advance = () => {
    if (done || !current) return;
    if (!lineDone) {
      cancel();
      setCharIdx(current.text.length);
      setLineDone(true);
      setSpeaking(false);
    } else if (lineIdx < LINES.length - 1) {
      setLineIdx((l) => l + 1);
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
          <div
            className={`relative rounded-full ${speaking ? "ring-2 ring-[color:var(--accent)]" : ""}`}
            style={
              speaking
                ? { boxShadow: "0 0 16px var(--accent)", transition: "box-shadow .2s" }
                : undefined
            }
          >
            <Image
              src="/images/manager-ai.png"
              alt="LOGOUT MANAGER AI"
              width={44}
              height={44}
              className="rounded-full border border-[color:var(--accent)]"
            />
          </div>
          <div>
            <div className="ve-title text-xs tracking-[0.3em] text-[color:var(--accent-bright)]">
              LOGIN / LOGOUT MANAGER AI
            </div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-[color:var(--text-sub)]">
              {speaking ? (
                <span className="flex items-center gap-1 text-[color:var(--accent-bright)]">
                  <span className="ve-blink">◖</span> SPEAKING…
                </span>
              ) : (
                "USER PROTECTION PROTOCOL"
              )}
            </div>
          </div>
          {voiceSupported && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (voiceOn) cancel();
                setVoiceOn((v) => !v);
              }}
              aria-label={voiceOn ? "読み上げをオフ" : "読み上げをオン"}
              className="ml-auto flex items-center gap-1.5 rounded-sm border border-[color:var(--border)] px-2.5 py-1.5 text-[10px] tracking-[0.2em] text-[color:var(--text-sub)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent-bright)]"
            >
              {voiceOn ? "🔊 音声 ON" : "🔇 音声 OFF"}
            </button>
          )}
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
                {isCurrent && !lineDone && (
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
                {lineDone
                  ? lineIdx < LINES.length - 1
                    ? "▶ タップで次へ"
                    : "▶ タップで完了"
                  : "タップでスキップ"}
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
