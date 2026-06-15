import type { AnswerLog, GameResult, Rank } from "@/types/game";
import { SUCCESS_THRESHOLD } from "@/lib/mockData";

const RANK_TABLE: { min: number; rank: Rank; title: string }[] = [
  { min: 90, rank: "S", title: "極めて人間的なノイズ源" },
  { min: 75, rank: "A", title: "生活音を持つ現実存在" },
  { min: 60, rank: "B", title: "おおむね人間" },
  { min: 40, rank: "C", title: "仮想人格疑惑あり" },
  { min: 0, rank: "D", title: "AI応答の可能性が高い" },
];

export function rankFor(totalScore: number): { rank: Rank; title: string } {
  const row = RANK_TABLE.find((r) => totalScore >= r.min) ?? RANK_TABLE[RANK_TABLE.length - 1];
  return { rank: row.rank, title: row.title };
}

/** 5問の合計（最大100）から総合結果を生成する。Mock/フォールバック共通。 */
export function buildResult(answers: AnswerLog[]): GameResult {
  const totalScore = answers.reduce((a, b) => a + b.score, 0);
  const { rank, title } = rankFor(totalScore);
  const success = totalScore >= SUCCESS_THRESHOLD;

  const allSignals = answers.flatMap((a) => a.signals);
  const goodPoints = uniq(
    allSignals.filter((s) =>
      ["短い反応", "音量ピーク検出", "音量変化あり", "口語的反応", "現実ノイズらしいピーク", "状況キーワード一致"].includes(s),
    ),
  ).slice(0, 3);

  const improvements: string[] = [];
  if (answers.some((a) => a.signals.includes("説明が長い")))
    improvements.push("補足は短く、思わず出た一言に近づける");
  if (answers.some((a) => !a.audioFeatures?.hasAudio))
    improvements.push("声や生活音を録音すると認証精度が上がる");
  if (answers.some((a) => (a.audioFeatures?.silenceRatio ?? 1) >= 0.7))
    improvements.push("無音が多い。もう少し声量を出す");
  if (improvements.length === 0)
    improvements.push("より雑で、現実のノイズを混ぜると人間味が増す");

  const aiComment = success
    ? rank === "S" || rank === "A"
      ? "音声に揺らぎ、間、生活感が検出された。人間として十分な反応だ。現実へ接続を許可する。"
      : "整いすぎてはいるが、人間反応として認められる。ログアウトを許可する。"
    : "音声または回答が合理的すぎる。人間は通常、もう少し無駄な感情やノイズを漏らすものだ。再認証を要求する。";

  return {
    totalScore,
    rank,
    success,
    title,
    aiComment,
    goodPoints: goodPoints.length ? goodPoints : ["反応を提出した"],
    improvements: improvements.slice(0, 3),
  };
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
