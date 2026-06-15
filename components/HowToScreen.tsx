"use client";

type Props = { onNext: () => void };

const STEPS: { label: string; body: string }[] = [
  {
    label: "01 / 状況提示",
    body: "管理AIが日常の状況を提示します。月曜朝、弁当の箸、寝坊、誤送信、現実音の5問。",
  },
  {
    label: "02 / 録音",
    body: "マイクで「思わず出る声」「一言」「現実音」を最大10秒録音します。完璧な回答は不要です。",
  },
  {
    label: "03 / 認証",
    body: "音量・無音率・ピーク・補足テキストを解析し、人間反応率を採点します。",
  },
];

export function HowToScreen({ onNext }: Props) {
  return (
    <div className="relative min-h-screen ve-scanlines">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/game-bg.png')" }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "rgba(5,8,22,0.85)" }}
      />

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <div className="text-[10px] tracking-[0.35em] text-[color:var(--accent-bright)]">
          BRIEFING
        </div>
        <h2 className="ve-title mt-2 text-3xl text-[color:var(--text)] sm:text-4xl">
          遊び方
        </h2>

        <div className="ve-frame mt-6 rounded-sm p-5 text-sm leading-relaxed text-[color:var(--text-sub)] sm:text-[15px]">
          あなたは、電子空間に取り残された人間の協力者です。
          <br />
          ログアウト管理AIは、対象が本当に人間かを疑っています。
          <br />
          <span className="text-[color:var(--accent-bright)]">
            3分以内に5つの人間性認証を突破
          </span>
          してください。
        </div>

        <div className="mt-6 grid gap-3">
          {STEPS.map((s) => (
            <div key={s.label} className="ve-frame rounded-sm px-4 py-3">
              <div className="text-[10px] tracking-[0.3em] text-[color:var(--accent-bright)]">
                {s.label}
              </div>
              <div className="mt-1 text-sm text-[color:var(--text)]">{s.body}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-sm border border-dashed border-[color:var(--border)] px-4 py-3 text-xs leading-relaxed text-[color:var(--text-sub)]">
          疲れ・迷い・しょうもなさ・生活感ほど高評価です。
          <br />
          マイクが使えない場合は、テキスト入力で代替できます。
          <br />
          APIキー未設定でも Mock Mode で最後まで遊べます。
        </div>

        <button
          type="button"
          onClick={onNext}
          className="ve-title mt-auto mt-8 w-full cursor-pointer border-2 border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-6 py-4 text-base tracking-[0.3em] text-[color:var(--accent-bright)] transition-all hover:bg-[color:var(--accent)]/25 hover:shadow-[0_0_18px_var(--accent)] active:translate-y-px"
        >
          &gt; マイク許可へ
        </button>
      </div>
    </div>
  );
}
