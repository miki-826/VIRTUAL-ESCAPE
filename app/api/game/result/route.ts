import { NextResponse } from "next/server";
import { buildResult } from "@/lib/score";
import { chatJson, HAS_OPENAI } from "@/lib/openai";
import type { AnswerLog, GameResult } from "@/types/game";
import { SUCCESS_THRESHOLD } from "@/lib/mockData";

type Body = { sessionId?: string; answers?: AnswerLog[] };

const SYSTEM_PROMPT = `あなたはWebゲーム「VIRTUAL ESCAPE」のログアウト管理AIです。
5問の回答結果と音声特徴量をもとに、対象ユーザーが人間としてログアウト可能かをゲーム内判定します。
出力は必ずJSONのみで、{"aiComment": string, "goodPoints": string[], "improvements": string[]} の形式。
SF世界観に合うコメントで、皮肉を少し含めてもよいがプレイヤーを傷つけないこと。
本人確認や心理診断のように断定しないでください。日本語で短く返してください。`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const answers = Array.isArray(body.answers) ? body.answers : [];
  const baseResult = buildResult(answers);

  if (!HAS_OPENAI || answers.length === 0) {
    return NextResponse.json(baseResult satisfies GameResult);
  }

  const ai = await chatJson<{
    aiComment: string;
    goodPoints: string[];
    improvements: string[];
  }>([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        `totalScore: ${baseResult.totalScore} / 100`,
        `rank: ${baseResult.rank}`,
        `success: ${baseResult.success} (>=${SUCCESS_THRESHOLD})`,
        `各問サマリー:`,
        ...answers.map(
          (a, i) =>
            `  Q${i + 1} [${a.category}] score=${a.score}/${a.maxScore} text="${a.answerText}" signals=${a.signals.join("/")}`,
        ),
      ].join("\n"),
    },
  ]);

  if (!ai) return NextResponse.json(baseResult satisfies GameResult);

  return NextResponse.json({
    ...baseResult,
    aiComment: ai.aiComment ?? baseResult.aiComment,
    goodPoints: Array.isArray(ai.goodPoints) && ai.goodPoints.length
      ? ai.goodPoints.slice(0, 3)
      : baseResult.goodPoints,
    improvements: Array.isArray(ai.improvements) && ai.improvements.length
      ? ai.improvements.slice(0, 3)
      : baseResult.improvements,
  } satisfies GameResult);
}
