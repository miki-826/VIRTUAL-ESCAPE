import type { AudioFeatures } from "@/types/game";

const rawKey = process.env.OPENAI_API_KEY ?? "";
// "ollama" 等のダミー値で実APIを叩いて失敗するのを避け、sk- で始まる本物のキーだけを有効とみなす
export const HAS_OPENAI = rawKey.startsWith("sk-");

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type ChatMessage = { role: "system" | "user"; content: string };

/** OpenAI Chat Completions を JSON モードで叩く。失敗時は null を返し、呼び出し側で Mock にフォールバックする。 */
export async function chatJson<T>(messages: ChatMessage[]): Promise<T | null> {
  if (!HAS_OPENAI) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rawKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function audioFeaturesSummary(f: AudioFeatures | null): string {
  if (!f) return "音声特徴量なし（テキスト回答）";
  return [
    `durationSec=${f.durationSec}`,
    `averageVolume=${f.averageVolume}`,
    `peakVolume=${f.peakVolume}`,
    `silenceRatio=${f.silenceRatio}`,
    `volumeVariance=${f.volumeVariance}`,
    `burstCount=${f.burstCount}`,
    `hasAudio=${f.hasAudio}`,
  ].join(", ");
}
