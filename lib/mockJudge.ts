import type { AudioFeatures, ChallengeType } from "@/types/game";

export const MAX_SCORE = 20;

export function judgeMockAnswer(params: {
  answerText: string;
  keywords: string[];
  audioFeatures: AudioFeatures | null;
  challengeType: ChallengeType;
}): { score: number; comment: string; signals: string[] } {
  const { answerText, keywords, audioFeatures, challengeType } = params;
  const text = answerText.trim();
  const signals: string[] = [];
  let score = 0;

  if (audioFeatures?.hasAudio) {
    score += 3;
    signals.push("録音検出");

    if (audioFeatures.durationSec >= 1 && audioFeatures.durationSec <= 8) {
      score += 3;
      signals.push("短い反応");
    }
    if (audioFeatures.averageVolume > 0.015) {
      score += 3;
      signals.push("音量あり");
    }
    if (audioFeatures.peakVolume > 0.08) {
      score += 3;
      signals.push("音量ピーク検出");
    }
    if (audioFeatures.silenceRatio < 0.7) {
      score += 3;
      signals.push("無音率正常");
    }
    if (audioFeatures.volumeVariance > 0.005 || audioFeatures.burstCount >= 1) {
      score += 2;
      signals.push("音量変化あり");
    }
  }

  if (text.length >= 1 && text.length <= 40) {
    score += 2;
    signals.push("短い補足");
  }

  const hitCount = keywords.filter((keyword) => text.includes(keyword)).length;
  if (hitCount > 0) {
    score += Math.min(hitCount * 2, 4);
    signals.push("状況キーワード一致");
  }

  const humanNoises = [
    "…",
    "はぁ",
    "あ",
    "いや",
    "なんで",
    "無理",
    "終わった",
    "待って",
    "もう",
  ];
  if (humanNoises.some((word) => text.includes(word))) {
    score += 2;
    signals.push("口語的反応");
  }

  if (!audioFeatures?.hasAudio && !text) {
    score = 0;
    signals.length = 0;
    signals.push("未入力");
  }

  if (text.length > 80) {
    score -= 3;
    signals.push("説明が長い");
  }

  if (
    challengeType === "NOISE_REACTION" &&
    audioFeatures?.peakVolume &&
    audioFeatures.peakVolume > 0.12
  ) {
    score += 2;
    signals.push("現実ノイズらしいピーク");
  }

  const finalScore = Math.max(0, Math.min(MAX_SCORE, score));

  return {
    score: finalScore,
    comment:
      finalScore >= 16
        ? "音声と反応に人間らしい揺らぎが検出されました。"
        : finalScore >= 10
          ? "認証可能な反応ですが、少し整っています。"
          : "音声または反応が不足しています。より短く自然な反応が必要です。",
    signals,
  };
}
