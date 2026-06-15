"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type {
  AnswerLog,
  AnswerResponse,
  AudioFeatures,
  Challenge,
} from "@/types/game";
import { useRecorder, MAX_RECORD_SEC } from "@/hooks/useRecorder";
import { analyzeAudioBlob, EMPTY_FEATURES } from "@/lib/audioFeatures";
import { Waveform } from "@/components/Waveform";
import { SystemHeader } from "@/components/SystemHeader";
import { HelpOverlay } from "@/components/HelpOverlay";
import { formatTime, sanitizeInput } from "@/lib/utils";

type Props = {
  challenge: Challenge;
  round: number;
  totalRounds: number;
  totalSec: number;
  remainingSec: number;
  mockMode: boolean;
  sessionId: string;
  textFallback: boolean;
  onSubmitted: (log: AnswerLog) => void;
};

type Phase = "input" | "analyzing" | "result";

export function GameScreen({
  challenge,
  round,
  totalRounds,
  totalSec,
  remainingSec,
  mockMode,
  sessionId,
  textFallback,
  onSubmitted,
}: Props) {
  const recorder = useRecorder();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const playingRef = useRef<HTMLAudioElement | null>(null);
  const phaseStartSec = useRef(remainingSec);
  const [showHelp, setShowHelp] = useState(round === 1);
  const helpSeen = useRef(round === 1);

  useEffect(() => {
    setText("");
    setPhase("input");
    setResult(null);
    recorder.reset();
    phaseStartSec.current = remainingSec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  const elapsedSec = Math.max(0, phaseStartSec.current - remainingSec);
  const recordingSec = recorder.elapsedMs / 1000;

  const onStartRec = async () => {
    setResult(null);
    const w = window as unknown as { __veDuckBgm?: (ms: number) => void };
    w.__veDuckBgm?.(MAX_RECORD_SEC * 1000);
    await recorder.start();
  };

  const onStopRec = () => recorder.stop();

  const onPlayBack = () => {
    if (!recorder.audioUrl) return;
    if (playingRef.current) {
      playingRef.current.pause();
      playingRef.current.currentTime = 0;
    }
    const a = new Audio(recorder.audioUrl);
    playingRef.current = a;
    a.play().catch(() => {});
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setPhase("analyzing");
    let features: AudioFeatures = { ...EMPTY_FEATURES };
    if (recorder.audioBlob) features = await analyzeAudioBlob(recorder.audioBlob);

    try {
      const res = await fetch("/api/game/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          challengeId: challenge.id,
          answerText: text,
          audioFeatures: features,
          elapsedSec,
        }),
      });
      const data = (await res.json()) as AnswerResponse;
      setResult(data);
      setPhase("result");

      const log: AnswerLog = {
        challengeId: challenge.id,
        category: challenge.category,
        answerText: text,
        audioFeatures: features.hasAudio ? features : null,
        score: data.score,
        maxScore: data.maxScore,
        comment: data.comment,
        signals: data.signals,
        elapsedSec,
      };
      setTimeout(() => onSubmitted(log), 1600);
    } catch {
      const fb: AnswerResponse = {
        score: 8,
        maxScore: 20,
        comment: "通信に失敗しました。Mock判定で続行します。",
        signals: ["通信失敗"],
      };
      setResult(fb);
      setPhase("result");
      setTimeout(
        () =>
          onSubmitted({
            challengeId: challenge.id,
            category: challenge.category,
            answerText: text,
            audioFeatures: features.hasAudio ? features : null,
            score: fb.score,
            maxScore: fb.maxScore,
            comment: fb.comment,
            signals: fb.signals,
            elapsedSec,
          }),
        1600,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = useMemo(() => {
    if (phase !== "input" || submitting) return false;
    if (textFallback) return text.trim().length > 0;
    return Boolean(recorder.audioBlob) || text.trim().length > 0;
  }, [phase, submitting, textFallback, recorder.audioBlob, text]);

  const isRec = recorder.recording;
  const mode: "idle" | "recording" | "analyzing" =
    isRec ? "recording" : phase === "analyzing" ? "analyzing" : "idle";

  return (
    <div className="relative min-h-screen ve-scanlines pb-32 sm:pb-12">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/game-bg.png')" }}
      />
      <div className="absolute inset-0 -z-10 ve-grid-bg opacity-25" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "rgba(5,8,22,0.85)" }}
      />

      <div className="mx-auto max-w-3xl px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="relative">
          <SystemHeader
            remainingSec={remainingSec}
            totalSec={totalSec}
            round={round}
            totalRounds={totalRounds}
            mockMode={mockMode}
          />
          <button
            type="button"
            onClick={() => {
              helpSeen.current = false;
              setShowHelp(true);
            }}
            aria-label="操作説明を開く"
            className="absolute -bottom-3 right-2 z-20 grid h-7 w-7 place-items-center rounded-full border border-[color:var(--accent)] bg-[color:var(--bg)] text-xs text-[color:var(--accent-bright)] transition-colors hover:bg-[color:var(--accent)]/20 sm:-right-2"
          >
            ?
          </button>
        </div>

        <main className="mt-4 grid gap-4 sm:mt-6">
          <section className="ve-frame relative overflow-hidden rounded-sm">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--panel-2)]/40 px-3 py-2 sm:px-4">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent-bright)]" />
                HUMANITY CHECK / {challenge.category}
              </div>
              <div className="ve-title text-xs text-[color:var(--text-sub)]">
                {challenge.title}
              </div>
            </div>
            <div className="space-y-3 px-3 py-4 sm:px-5 sm:py-5">
              <div>
                <div className="mb-1 text-[10px] tracking-[0.3em] text-[color:var(--text-sub)]">
                  SITUATION
                </div>
                <p className="text-[15px] leading-relaxed text-[color:var(--text)] sm:text-base">
                  {challenge.situation}
                </p>
              </div>
              <div>
                <div className="mb-1 text-[10px] tracking-[0.3em] text-[color:var(--text-sub)]">
                  INSTRUCTION
                </div>
                <p className="text-sm leading-relaxed text-[color:var(--accent-bright)]">
                  {challenge.instruction}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {challenge.examples.map((e) => (
                  <span
                    key={e}
                    className="rounded-sm border border-[color:var(--border)] px-2 py-0.5 text-[10px] text-[color:var(--text-sub)]"
                  >
                    例: {e}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {!textFallback && (
            <section className="ve-frame rounded-sm px-3 py-3 sm:px-5 sm:py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] tracking-[0.3em] text-[color:var(--text-sub)]">
                  VOICE INPUT
                </div>
                <div className="text-[11px] tabular-nums text-[color:var(--text-sub)]">
                  {isRec
                    ? `${recordingSec.toFixed(1)}s / ${MAX_RECORD_SEC}s`
                    : recorder.audioBlob
                      ? "録音済み"
                      : "待機"}
                </div>
              </div>
              <Waveform
                levels={recorder.levels}
                active={isRec || phase === "analyzing"}
                mode={mode}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {!isRec ? (
                  <button
                    type="button"
                    onClick={onStartRec}
                    disabled={submitting || phase !== "input"}
                    className={`ve-title flex-1 cursor-pointer border-2 px-4 py-3 text-sm tracking-[0.25em] transition-all disabled:opacity-40 sm:flex-none ${
                      recorder.audioBlob
                        ? "border-[color:var(--border)] text-[color:var(--text-sub)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent-bright)]"
                        : "border-[color:var(--danger)] bg-[color:var(--danger)]/10 text-[color:var(--danger)] hover:bg-[color:var(--danger)]/20"
                    }`}
                  >
                    {recorder.audioBlob ? "● 再録音" : "● 録音開始"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStopRec}
                    className="ve-title ve-rec-pulse flex-1 cursor-pointer border-2 border-[color:var(--danger)] bg-[color:var(--danger)] px-4 py-3 text-sm tracking-[0.25em] text-white sm:flex-none"
                  >
                    ■ 停止
                  </button>
                )}
                <button
                  type="button"
                  onClick={onPlayBack}
                  disabled={!recorder.audioBlob || isRec}
                  className="cursor-pointer border-2 border-[color:var(--border)] px-4 py-3 text-xs tracking-[0.25em] text-[color:var(--text-sub)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent-bright)] disabled:opacity-40"
                >
                  ▶ 再生
                </button>
              </div>
              {recorder.micStatus === "denied" && (
                <p className="mt-2 text-[11px] text-[color:var(--danger)]">
                  マイクが拒否されました。下のテキスト入力で続行できます。
                </p>
              )}
            </section>
          )}

          <section className="ve-frame rounded-sm px-3 py-3 sm:px-5 sm:py-4">
            <div className="mb-2 text-[10px] tracking-[0.3em] text-[color:var(--text-sub)]">
              {textFallback ? "TEXT INPUT" : "OPTIONAL TEXT"}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(sanitizeInput(e.target.value, 80))}
              maxLength={80}
              placeholder={
                textFallback
                  ? "例: いや、箸ないんかい"
                  : "補足: 例「いや、箸ないんかい」(任意・80字以内)"
              }
              rows={2}
              disabled={phase !== "input"}
              className="w-full resize-none rounded-sm border border-[color:var(--border)] bg-black/40 px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--text-sub)]/60 focus:border-[color:var(--accent)] focus:outline-none disabled:opacity-60"
            />
            <div className="mt-1 text-right text-[10px] text-[color:var(--text-sub)]">
              {text.length} / 80
            </div>
          </section>

          {result && phase === "result" && (
            <section className="ve-frame relative rounded-sm border-[color:var(--accent)]/60 px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/manager-ai.png"
                    alt="LOGOUT MANAGER AI"
                    width={36}
                    height={36}
                    className="rounded-full border border-[color:var(--accent)]"
                  />
                  <div className="text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
                    JUDGMENT
                  </div>
                </div>
                <div className="ve-title text-xl tabular-nums text-[color:var(--accent-bright)] sm:text-2xl">
                  {result.score}{" "}
                  <span className="text-xs text-[color:var(--text-sub)]">
                    / {result.maxScore}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[color:var(--text)]">
                {result.comment}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.signals.map((s) => (
                  <span
                    key={s}
                    className="rounded-sm border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-2 py-0.5 text-[10px] text-[color:var(--accent-bright)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {phase === "analyzing" && (
            <section className="ve-frame rounded-sm px-4 py-4 text-center">
              <div className="ve-title text-sm tracking-[0.3em] text-[color:var(--scan-purple)]">
                AUTHENTICATING...
              </div>
              <div className="mt-1 text-xs text-[color:var(--text-sub)]">
                音声特徴量とテキストを解析中
              </div>
            </section>
          )}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--bg)]/95 px-3 py-3 backdrop-blur sm:static sm:mt-6 sm:mx-auto sm:max-w-3xl sm:border-none sm:bg-transparent sm:px-6 sm:py-0 sm:backdrop-blur-0">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="hidden flex-1 text-[10px] tracking-[0.25em] text-[color:var(--text-sub)] sm:block">
            ELAPSED {formatTime(elapsedSec)}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="ve-title flex-1 cursor-pointer border-2 border-[color:var(--accent)] bg-[color:var(--accent)]/20 px-6 py-3 text-sm tracking-[0.3em] text-[color:var(--accent-bright)] transition-all hover:bg-[color:var(--accent)]/35 hover:shadow-[0_0_18px_var(--accent)] disabled:opacity-40 sm:flex-none sm:px-10"
          >
            この反応を提出
          </button>
        </div>
      </div>

      {showHelp && (
        <HelpOverlay
          firstTime={helpSeen.current}
          onClose={() => {
            helpSeen.current = false;
            setShowHelp(false);
          }}
        />
      )}
    </div>
  );
}
