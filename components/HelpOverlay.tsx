"use client";

type Props = { onClose: () => void; firstTime: boolean };

const STEPS: { no: string; title: string; body: string; tone: "rec" | "cyan" | "sub" }[] = [
  {
    no: "01",
    title: "状況を読む",
    body: "上部のカードに「状況」と「指示」が出ます。月曜の朝、箸のない弁当──人間ならどう反応する？",
    tone: "cyan",
  },
  {
    no: "02",
    title: "● 録音開始 → ■ 停止",
    body: "赤い録音ボタンを押して、思わず出る声・ため息・一言を録音。最大10秒で自動停止。▶ で聞き直せます。",
    tone: "rec",
  },
  {
    no: "03",
    title: "補足テキスト（任意）",
    body: "声に出しづらい時は、下の入力欄に一言だけ書いてもOK（80字まで）。マイク不可なら自動でテキスト入力に切替。",
    tone: "sub",
  },
  {
    no: "04",
    title: "この反応を提出",
    body: "提出すると管理AIが「人間反応率」を採点。完璧さより、疲れ・雑さ・生活感が高評価です。",
    tone: "cyan",
  },
  {
    no: "05",
    title: "残り180秒 / 全5問",
    body: "右上の T- がタイマー。時間切れ・5問終了で判定へ。テンポよく、直感で答えて。",
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
      <div className="ve-frame ve-scanlines relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-sm">
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

        {/* ミニ画面図：実際のレイアウトの縮図 */}
        <div className="px-4 pt-4">
          <div className="relative rounded-sm border border-[color:var(--border)] bg-black/40 p-3 text-[10px] text-[color:var(--text-sub)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-1.5">
              <span>CHECK 01/05</span>
              <span className="ve-title text-[color:var(--accent-bright)]">T- 02:41</span>
            </div>
            <div className="mt-2 rounded-sm border border-[color:var(--border)] px-2 py-1.5 text-[color:var(--text)]">
              状況 / 指示
            </div>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block w-[3px] rounded-[1px] bg-[color:var(--voice-cyan)]"
                  style={{ height: `${6 + ((i * 7) % 18)}px`, opacity: 0.7 }}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <span className="rounded-sm border border-[color:var(--danger)] px-2 py-0.5 text-[color:var(--danger)]">
                ● 録音
              </span>
              <span className="rounded-sm border border-[color:var(--border)] px-2 py-0.5">
                ■ 停止
              </span>
              <span className="rounded-sm border border-[color:var(--border)] px-2 py-0.5">
                ▶ 再生
              </span>
              <span className="ml-auto rounded-sm border border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-2 py-0.5 text-[color:var(--accent-bright)]">
                提出
              </span>
            </div>
          </div>
        </div>

        <ol className="space-y-3 px-4 py-4">
          {STEPS.map((s) => (
            <li key={s.no} className="flex gap-3">
              <div
                className="ve-title mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border text-xs"
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
