"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Web Speech API による日本語読み上げ。管理AIの放送をAIらしく喋らせる。
 * 非対応ブラウザでは supported:false を返し、無音で進行する（停止させない）。
 */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const ja = voices.filter((v) => v.lang?.toLowerCase().startsWith("ja"));
      voiceRef.current =
        ja.find((v) => /google|natural|neural/i.test(v.name)) ??
        ja[0] ??
        voices[0] ??
        null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported) {
        onEnd?.();
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang ?? "ja-JP";
      // 落ち着いた機械音声風に
      u.rate = 0.96;
      u.pitch = 0.85;
      u.volume = 1;
      if (onEnd) u.onend = () => onEnd();
      synth.speak(u);
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speak, cancel };
}
