import type { AnswerLog, GameResult } from "@/types/game";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const HAS_SUPABASE = url.length > 0 && anonKey.length > 0;

/**
 * Supabase が設定されている場合のみ REST 経由で結果を保存する。
 * 未設定・失敗時は何もしない（呼び出し側で LocalStorage 保存にフォールバック済み）。
 * 依存パッケージを増やさないため PostgREST を直接叩く。
 */
export async function saveResultToSupabase(params: {
  sessionId: string;
  mockMode: boolean;
  result: GameResult;
  answers: AnswerLog[];
}): Promise<boolean> {
  if (!HAS_SUPABASE) return false;
  try {
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    await fetch(`${url}/rest/v1/game_results`, {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          session_id: params.sessionId,
          total_score: params.result.totalScore,
          rank: params.result.rank,
          success: params.result.success,
          title: params.result.title,
          ai_comment: params.result.aiComment,
        },
      ]),
    });
    return true;
  } catch {
    return false;
  }
}
