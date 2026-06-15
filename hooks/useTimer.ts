"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** カウントダウンタイマー。0 になると onExpire を一度だけ呼ぶ。 */
export function useTimer(limitSec: number) {
  const [remainingSec, setRemainingSec] = useState(limitSec);
  const [running, setRunning] = useState(false);
  const onExpireRef = useRef<(() => void) | null>(null);
  const firedRef = useRef(false);

  const start = useCallback(() => {
    setRemainingSec(limitSec);
    firedRef.current = false;
    setRunning(true);
  }, [limitSec]);

  const stop = useCallback(() => setRunning(false), []);

  const setOnExpire = useCallback((fn: () => void) => {
    onExpireRef.current = fn;
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          if (!firedRef.current) {
            firedRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return { remainingSec, running, start, stop, setOnExpire };
}
