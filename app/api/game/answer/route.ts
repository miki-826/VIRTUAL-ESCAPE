import { NextResponse } from "next/server";
import { MOCK_CHALLENGES } from "@/lib/mockData";
import { judgeMockAnswer, MAX_SCORE } from "@/lib/mockJudge";
import { audioFeaturesSummary, chatJson, HAS_OPENAI } from "@/lib/openai";
import type { AnswerResponse, AudioFeatures } from "@/types/game";
import { sanitizeInput } from "@/lib/utils";

type Body = {
  challengeId?: string;
  answerText?: string;
  audioFeatures?: AudioFeatures | null;
};

const SYSTEM_PROMPT = `あなたはWebゲーム「VIRTUAL ESCAPE」のログアウト管理AIです。
プレイヤーは電子空間に取り残された人間を救うため、状況に対する「声」「一言」「現実音」を提出します。
音声特徴量と補足テキストを評価し、人間反応として何点付けられるかを採点してください。
これは本人確認や心理診断ではなくゲーム演出です。
出力は必ずJSONのみで、{ "score": number (0-20), "comment": string, "signals": string[] } の形式にしてください。
日本語で短く返してください。`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const challenge = MOCK_CHALLENGES.find((c) => c.id === body.challengeId);
  if (!challenge) {
    return NextResponse.json({ error: "challenge not found" }, { status: 400 });
  }

  const answerText = sanitizeInput(body.answerText ?? "");
  const audioFeatures = body.audioFeatures ?? null;
  const challengeType = challenge.type;
  const keywords = challenge.keywords ?? [];

  const fallback = (): AnswerResponse => {
    const m = judgeMockAnswer({
      answerText,
      keywords,
      audioFeatures,
      challengeType,
    });
    return {
      score: m.score,
      maxScore: MAX_SCORE,
      comment: m.comment,
      signals: m.signals,
    };
  };

  if (!HAS_OPENAI) return NextResponse.json(fallback());

  const ai = await chatJson<{
    score: number;
    comment: string;
    signals: string[];
  }>([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        `課題カテゴリ: ${challenge.category}`,
        `課題タイトル: ${challenge.title}`,
        `状況: ${challenge.situation}`,
        `指示: ${challenge.instruction}`,
        `judgeFocus: ${challenge.judgeFocus.join(" / ")}`,
        `補足テキスト: ${answerText || "(なし)"}`,
        `音声特徴量: ${audioFeaturesSummary(audioFeatures)}`,
      ].join("\n"),
    },
  ]);

  if (!ai || typeof ai.score !== "number") {
    return NextResponse.json(fallback());
  }

  const safeScore = Math.max(0, Math.min(MAX_SCORE, Math.round(ai.score)));
  return NextResponse.json({
    score: safeScore,
    maxScore: MAX_SCORE,
    comment: ai.comment ?? "認証データを評価しました。",
    signals: Array.isArray(ai.signals) ? ai.signals.slice(0, 6) : [],
  } satisfies AnswerResponse);
}
