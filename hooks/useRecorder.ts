"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_RECORD_SEC = 10;

export type MicStatus = "idle" | "ready" | "denied" | "unsupported";

export type RecorderState = {
  micStatus: MicStatus;
  recording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  /** 直近のライブ音量（0..1）。波形描画に使う。 */
  levels: number[];
  elapsedMs: number;
};

const LEVEL_COUNT = 48;

export function useRecorder() {
  const [state, setState] = useState<RecorderState>({
    micStatus: "idle",
    recording: false,
    audioBlob: null,
    audioUrl: null,
    levels: new Array(LEVEL_COUNT).fill(0),
    elapsedMs: 0,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const urlRef = useRef<string | null>(null);

  const requestMic = useCallback(async (): Promise<boolean> => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof window === "undefined" ||
      typeof window.MediaRecorder === "undefined"
    ) {
      setState((s) => ({ ...s, micStatus: "unsupported" }));
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setState((s) => ({ ...s, micStatus: "ready" }));
      return true;
    } catch {
      setState((s) => ({ ...s, micStatus: "denied" }));
      return false;
    }
  }, []);

  const stopLevelLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const startLevelLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      const level = Math.min(1, rms * 3.2);
      setState((s) => {
        const next = s.levels.slice(1);
        next.push(level);
        return {
          ...s,
          levels: next,
          elapsedMs: Date.now() - startTimeRef.current,
        };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
    stopLevelLoop();
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, [stopLevelLoop]);

  const start = useCallback(async (): Promise<boolean> => {
    let stream = streamRef.current;
    if (!stream) {
      const ok = await requestMic();
      if (!ok) return false;
      stream = streamRef.current;
    }
    if (!stream) return false;

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    chunksRef.current = [];

    try {
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setState((s) => ({
          ...s,
          recording: false,
          audioBlob: blob,
          audioUrl: url,
        }));
      };

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new Ctx();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      startTimeRef.current = Date.now();
      recorder.start();
      setState((s) => ({
        ...s,
        recording: true,
        audioBlob: null,
        audioUrl: null,
        levels: new Array(LEVEL_COUNT).fill(0),
        elapsedMs: 0,
      }));
      startLevelLoop();
      autoStopRef.current = setTimeout(stop, MAX_RECORD_SEC * 1000);
      return true;
    } catch {
      setState((s) => ({ ...s, micStatus: "unsupported", recording: false }));
      return false;
    }
  }, [requestMic, startLevelLoop, stop]);

  const reset = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setState((s) => ({
      ...s,
      recording: false,
      audioBlob: null,
      audioUrl: null,
      levels: new Array(LEVEL_COUNT).fill(0),
      elapsedMs: 0,
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      stopLevelLoop();
      audioCtxRef.current?.close().catch(() => {});
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [stopLevelLoop]);

  return { ...state, requestMic, start, stop, reset };
}
