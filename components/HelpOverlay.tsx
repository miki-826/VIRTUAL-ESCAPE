"use client";
import Image from "next/image";

type Props = { onClose: () => void; firstTime: boolean };

const LEGEND: { no: string; title: string; body: string; tone: "rec" | "cyan" | "sub" }[] = [
  {
    no: "1",
    title: "状況を読む",
    body: "提示される「状況」に、人間ならどう反応する？を考える。",
    tone: "cyan",
  },
  {
    no: "2",
    title: "REC → STOP で録音",
    body: "赤いRECで録音開始、STOPで停止、PLAYで聞き直し。最大10秒。",
    tone: "rec",
  },
  {
    no: "3",
    title: "補足テキスト（任意）",
    body: "声に出しづらい時は一言だけ入力（80字）。マイク不可なら自動で入力モード。",
    tone: "sub",
  },
  {
    no: "4",
    title: "SUBMIT で提出",
    body: "管理AIが人間反応率を採点。完璧さより、疲れ・雑さ・生活感が高評価。",
    tone: "cyan",
  },
  {
    no: "5",
    title: "残り時間 / 全5問",
    body: "左上が残り時間。時間切れ・5問終了で判定へ。直感でテンポよく。",
    tone: "rec",
  },
];

function dotColor(tone: "rec" | "cyan" | "sub") {
  return tone === "rec"
    ? "var(--danger)"
    : tone === "sub"
      ? "var(--text-sub)"
      : "var(--accent-bright)";
}

export function HelpOverlay({ onClose, firstTime }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-6">
      <div
        className="absolute inset-0 bg-[color:var(--bg)]/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="ve-frame ve-scanlines relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm">
        <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--panel-2)]/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="ve-blink h-2 w-2 rounded-full bg-[color:var(--accent-bright)]" />
            <div className="ve-title text-sm tracking-[0.25em] text-[color:var(--accent-bright)]">
              認証マニュアル
            </div>
          </div>
          <div className="text-[10px] tracking-[0.25em] text-[color:var(--text-sub)]">
            HOW TO AUTHENTICATE
          </div>
        </div>

        {/* 画面内容をもとに生成した操作スライド */}
        <div className="px-4 pt-4">
          <div className="overflow-hidden rounded-sm border border-[color:var(--border)] bg-black/40">
            <Image
              src="/images/manual.png"
              alt="操作画面のガイド"
              width={1536}
              height={1024}
              className="h-auto w-full"
              priority
            />
          </div>
          <p className="mt-2 text-center text-[10px] tracking-[0.2em] text-[color:var(--text-sub)]">
            ↓ 番号①〜⑤の操作
          </p>
        </div>

        <ol className="space-y-2.5 px-4 py-4">
          {LEGEND.map((s) => (
            <li key={s.no} className="flex gap-3">
              <div
                className="ve-title mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs"
                style={{ borderColor: dotColor(s.tone), color: dotColor(s.tone) }}
              >
                {s.no}
              </div>
              <div>
                <div className="text-sm font-medium text-[color:var(--text)]">
                  {s.title}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--text-sub)]">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="border-t border-[color:var(--border)] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="ve-title w-full cursor-pointer border-2 border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-6 py-3 text-sm tracking-[0.3em] text-[color:var(--accent-bright)] transition-all hover:bg-[color:var(--accent)]/30 hover:shadow-[0_0_14px_var(--accent)]"
          >
            {firstTime ? "> 認証を始める" : "> 閉じる"}
          </button>
        </div>
      </div>
    </div>
  );
}
