"use client";
import { useEffect, useRef, useState } from "react";
import { getSettings, saveSettings } from "@/lib/storage";

type Props = { src: string };

/**
 * 画面右下に固定する BGM プレイヤー。
 * - 自動再生はブラウザにブロックされるため、最初のユーザー操作で再生開始する
 * - ミュートトグルと音量スライダー（0..100）。設定は LocalStorage に保存
 * - 録音中は低音量にダックする（duck() を window 経由で公開）
 */
export function BgmController({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const duckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseVolumeRef = useRef(0.5);

  useEffect(() => {
    const settings = getSettings();
    setMuted(!settings.soundEnabled);
    setVolume(settings.bgmVolume);
    baseVolumeRef.current = settings.bgmVolume;
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const tryStart = () => {
      audio.play().then(() => setReady(true)).catch(() => {});
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
    };
    window.addEventListener("pointerdown", tryStart);
    window.addEventListener("keydown", tryStart);
    return () => {
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
    };
  }, []);

  useEffect(() => {
    const w = window as unknown as {
      __veDuckBgm?: (durationMs: number) => void;
    };
    w.__veDuckBgm = (durationMs: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const base = muted ? 0 : volume;
      const duck = Math.max(0, base * 0.25);
      audio.volume = duck;
      if (duckTimerRef.current) clearTimeout(duckTimerRef.current);
      duckTimerRef.current = setTimeout(() => {
        if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
      }, durationMs);
    };
    return () => {
      delete w.__veDuckBgm;
    };
  }, [muted, volume]);

  const persist = (next: { soundEnabled?: boolean; bgmVolume?: number }) => {
    const settings = getSettings();
    saveSettings({
      ...settings,
      soundEnabled: next.soundEnabled ?? !muted,
      bgmVolume: next.bgmVolume ?? volume,
    });
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    persist({ soundEnabled: !next });
    if (!next && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  const onVolume = (v: number) => {
    setVolume(v);
    baseVolumeRef.current = v;
    if (muted && v > 0) {
      setMuted(false);
      persist({ soundEnabled: true, bgmVolume: v });
    } else {
      persist({ bgmVolume: v });
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-4 sm:right-4">
      <audio ref={audioRef} src={src} loop preload="auto" />
      <div
        className={`ve-frame flex items-center gap-2 rounded-sm px-2 py-1.5 transition-all ${
          open ? "pr-3" : ""
        }`}
      >
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "BGMを再生する" : "BGMをミュート"}
          className="grid h-9 w-9 place-items-center text-[color:var(--accent-bright)] hover:bg-[color:var(--accent)]/10 active:bg-[color:var(--accent)]/20"
        >
          {muted || volume === 0 ? <IconMute /> : <IconSound />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-[10px] tracking-[0.2em] text-[color:var(--text-sub)] hover:text-[color:var(--accent-bright)]"
          aria-label="BGM音量設定を開く"
        >
          BGM {Math.round(volume * 100)}
        </button>

        {open && (
          <div className="flex items-center gap-2 pl-1">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={(e) => onVolume(Number(e.target.value) / 100)}
              className="ve-volume h-1 w-28 cursor-pointer appearance-none rounded bg-[color:var(--border)] sm:w-36"
              aria-label="BGM音量"
            />
            {!ready && (
              <span className="text-[9px] tracking-[0.2em] text-[color:var(--text-sub)]">
                TAP TO START
              </span>
            )}
          </div>
        )}
      </div>
      <style>{`
        .ve-volume::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 14px; width: 14px; border-radius: 9999px;
          background: var(--accent-bright);
          box-shadow: 0 0 6px var(--accent);
          cursor: pointer;
        }
        .ve-volume::-moz-range-thumb {
          height: 14px; width: 14px; border-radius: 9999px;
          background: var(--accent-bright); border: none;
          box-shadow: 0 0 6px var(--accent);
        }
      `}</style>
    </div>
  );
}

function IconSound() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function IconMute() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
