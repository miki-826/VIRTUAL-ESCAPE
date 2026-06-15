import type { AudioFeatures } from "@/types/game";

export const EMPTY_FEATURES: AudioFeatures = {
  durationSec: 0,
  averageVolume: 0,
  peakVolume: 0,
  silenceRatio: 1,
  volumeVariance: 0,
  burstCount: 0,
  hasAudio: false,
};

/**
 * 録音された Blob を Web Audio API でデコードし、音量・無音率・ピーク・変化量などの
 * 特徴量を算出する。失敗時は hasAudio:false の空特徴量を返す（停止させない）。
 */
export async function analyzeAudioBlob(blob: Blob): Promise<AudioFeatures> {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return EMPTY_FEATURES;

    const arrayBuffer = await blob.arrayBuffer();
    const ctx = new Ctx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const durationSec = audioBuffer.duration;
    await ctx.close();

    if (data.length === 0) return { ...EMPTY_FEATURES, durationSec };

    // 約20msのフレームごとにRMSを取り、フレーム列で統計を取る
    const frameSize = Math.max(1, Math.floor(sampleRate * 0.02));
    const rmsFrames: number[] = [];
    let peak = 0;

    for (let i = 0; i < data.length; i += frameSize) {
      let sumSq = 0;
      let count = 0;
      for (let j = i; j < i + frameSize && j < data.length; j++) {
        const v = data[j];
        sumSq += v * v;
        const abs = Math.abs(v);
        if (abs > peak) peak = abs;
        count++;
      }
      rmsFrames.push(Math.sqrt(sumSq / Math.max(1, count)));
    }

    const averageVolume =
      rmsFrames.reduce((a, b) => a + b, 0) / rmsFrames.length;

    const silenceThreshold = 0.01;
    const silentFrames = rmsFrames.filter((r) => r < silenceThreshold).length;
    const silenceRatio = silentFrames / rmsFrames.length;

    const variance =
      rmsFrames.reduce((a, b) => a + (b - averageVolume) ** 2, 0) /
      rmsFrames.length;

    // 平均の2.2倍を超える立ち上がりを「バースト（叩く・打つ等）」としてカウント
    let burstCount = 0;
    const burstThreshold = Math.max(0.05, averageVolume * 2.2);
    let above = false;
    for (const r of rmsFrames) {
      if (r > burstThreshold && !above) {
        burstCount++;
        above = true;
      } else if (r < burstThreshold * 0.6) {
        above = false;
      }
    }

    return {
      durationSec: round(durationSec, 2),
      averageVolume: round(averageVolume, 4),
      peakVolume: round(peak, 4),
      silenceRatio: round(silenceRatio, 3),
      volumeVariance: round(variance, 5),
      burstCount,
      hasAudio: averageVolume > 0.0008 || peak > 0.02,
    };
  } catch {
    return EMPTY_FEATURES;
  }
}

function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
