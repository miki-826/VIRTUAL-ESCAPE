"use client";

type Props = {
  levels: number[];
  active: boolean;
  /** 録音中=danger赤、解析中=scan紫、待機=accent cyan */
  mode?: "idle" | "recording" | "analyzing";
};

export function Waveform({ levels, active, mode = "idle" }: Props) {
  const color =
    mode === "recording"
      ? "var(--danger)"
      : mode === "analyzing"
        ? "var(--scan-purple)"
        : "var(--voice-cyan)";
  const display = active ? levels : levels.map(() => 0.04);
  return (
    <div
      className="ve-frame relative flex h-20 items-center gap-[2px] overflow-hidden rounded-sm px-3"
      aria-hidden
    >
      {mode === "analyzing" && (
        <div
          className="ve-scan-sweep pointer-events-none absolute inset-x-0 h-12"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(168,85,247,0.35), transparent)",
          }}
        />
      )}
      {display.map((v, i) => {
        const h = Math.max(4, Math.round(v * 64));
        return (
          <span
            key={i}
            style={{
              height: `${h}px`,
              background: color,
              opacity: 0.55 + v * 0.45,
            }}
            className="inline-block w-[3px] rounded-[1px] transition-[height] duration-75"
          />
        );
      })}
    </div>
  );
}
