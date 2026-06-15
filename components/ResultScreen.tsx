"use client";
import Image from "next/image";
import type { AnswerLog, GameResult } from "@/types/game";

type Props = {
  result: GameResult;
  answers: AnswerLog[];
  best: number;
  onRetry: () => void;
  onEnding: () => void;
};

export function ResultScreen({
  result,
  answers,
  best,
  onRetry,
  onEnding,
}: Props) {
  const success = result.success;

  const avgPeak = avg(answers.map((a) => a.audioFeatures?.peakVolume ?? 0));
  const avgSilence = avg(
    answers
      .map((a) => a.audioFeatures?.silenceRatio)
      .filter((v): v is number => v !== undefined),
  );
  const hasNoise = answers.some(
    (a) => (a.audioFeatures?.burstCount ?? 0) >= 1,
  );

  return (
    <div className="relative min-h-screen ve-scanlines">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/result-bg.png')" }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "rgba(5,8,22,0.82)" }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="text-[10px] tracking-[0.4em] text-[color:var(--accent-bright)]">
          LOGOUT RESULT
        </div>
        <h2
          className={`ve-title mt-2 text-3xl sm:text-5xl ${
            success
              ? "text-[color:var(--success)]"
              : "text-[color:var(--danger)] ve-glitch"
          }`}
        >
          {success ? "LOGOUT SUCCESS" : "LOGOUT FAILED"}
        </h2>
        <p className="mt-2 text-xs tracking-[0.25em] text-[color:var(--text-sub)]">
          {success ? "現実への接続が許可されました。" : "再認証が必要です。"}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="人間反応率" value={`${result.totalScore}%`} accent />
          <Stat label="ランク" value={result.rank} />
          <Stat label="称号" value={result.title} small />
        </div>

        <section className="ve-frame mt-6 rounded-sm p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Image
              src="/images/manager-ai.png"
              alt="LOGOUT MANAGER AI"
              width={56}
              height={56}
              className="rounded-full border border-[color:var(--accent)]"
            />
            <div className="flex-1">
              <div className="text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
                LOGOUT MANAGER AI
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--text)]">
                {result.aiComment}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="ve-frame rounded-sm p-4">
            <div className="text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
              音声解析サマリー
            </div>
            <dl className="mt-2 space-y-1 text-xs">
              <Row label="平均ピーク音量" value={avgPeak.toFixed(3)} />
              <Row
                label="平均無音率"
                value={`${Math.round(avgSilence * 100)}%`}
              />
              <Row label="現実ノイズ検出" value={hasNoise ? "あり" : "弱"} />
              <Row label="ベストスコア" value={`${Math.max(best, result.totalScore)}`} />
            </dl>
          </section>

          <section className="ve-frame rounded-sm p-4">
            <div className="text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
              良かった点
            </div>
            <ul className="mt-2 space-y-1 text-xs text-[color:var(--text)]">
              {result.goodPoints.map((p) => (
                <li key={p}>+ {p}</li>
              ))}
            </ul>
            <div className="mt-3 text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
              改善点
            </div>
            <ul className="mt-2 space-y-1 text-xs text-[color:var(--text-sub)]">
              {result.improvements.map((p) => (
                <li key={p}>! {p}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="ve-frame mt-6 overflow-hidden rounded-sm">
          <div className="border-b border-[color:var(--border)] bg-[color:var(--panel-2)]/40 px-4 py-2 text-[10px] tracking-[0.3em] text-[color:var(--text-sub)]">
            各問のスコア
          </div>
          <ul>
            {answers.map((a, i) => (
              <li
                key={a.challengeId}
                className="flex items-start gap-3 border-b border-[color:var(--border)]/60 px-4 py-3 text-xs last:border-b-0"
              >
                <span className="ve-title text-[color:var(--accent-bright)]">
                  Q{i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-[10px] tracking-[0.25em] text-[color:var(--text-sub)]">
                    {a.category}
                  </div>
                  <div className="mt-0.5 text-[color:var(--text)]">
                    {a.comment}
                  </div>
                </div>
                <span className="ve-title tabular-nums text-[color:var(--accent-bright)]">
                  {a.score}/{a.maxScore}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onEnding}
            className="ve-title w-full cursor-pointer border-2 px-6 py-4 text-base tracking-[0.3em] transition-all active:translate-y-px"
            style={{
              borderColor: success ? "var(--success)" : "var(--danger)",
              color: success ? "var(--success)" : "var(--danger)",
              background: success
                ? "rgba(52,211,153,0.12)"
                : "rgba(239,68,68,0.12)",
            }}
          >
            &gt; この先を見る
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="ve-title w-full cursor-pointer border-2 border-[color:var(--border)] px-6 py-4 text-base tracking-[0.3em] text-[color:var(--text-sub)] transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent-bright)]"
          >
            &gt; もう一度
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="ve-frame rounded-sm px-4 py-3">
      <div className="text-[10px] tracking-[0.3em] text-[color:var(--text-sub)]">
        {label}
      </div>
      <div
        className={`ve-title mt-1 ${
          small ? "text-base" : "text-3xl"
        } ${accent ? "text-[color:var(--accent-bright)]" : "text-[color:var(--text)]"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--text-sub)]">{label}</dt>
      <dd className="ve-title tabular-nums text-[color:var(--text)]">{value}</dd>
    </div>
  );
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
