"use client";
import { useState } from "react";

type Props = {
  onReady: () => void;
  onTextFallback: () => void;
  requestMic: () => Promise<boolean>;
};

export function MicCheckScreen({ onReady, onTextFallback, requestMic }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const tryMic = async () => {
    setPending(true);
    setError(null);
    const ok = await requestMic();
    setPending(false);
    if (ok) onReady();
    else setError("マイクを利用できませんでした。テキスト反応で続行できます。");
  };

  return (
    <div className="relative min-h-screen ve-scanlines">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/game-bg.png')" }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "rgba(5,8,22,0.88)" }}
      />

      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-12">
        <div className="text-[10px] tracking-[0.35em] text-[color:var(--accent-bright)]">
          VOICE INPUT CHECK
        </div>
        <h2 className="ve-title mt-3 text-center text-3xl text-[color:var(--text)] sm:text-4xl">
          マイクを有効にする
        </h2>
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-[color:var(--text-sub)]">
          音声特徴量を解析するため、ブラウザのマイクを使用します。
          <br />
          音声ファイル自体はサーバーへ送信しません。
        </p>

        <button
          type="button"
          onClick={tryMic}
          disabled={pending}
          className="ve-title mt-10 w-full max-w-md cursor-pointer border-2 border-[color:var(--accent)] bg-[color:var(--accent)]/10 px-6 py-4 text-base tracking-[0.3em] text-[color:var(--accent-bright)] transition-all hover:bg-[color:var(--accent)]/25 hover:shadow-[0_0_18px_var(--accent)] disabled:opacity-50"
        >
          {pending ? "REQUESTING..." : "> マイクを有効にする"}
        </button>

        {error && (
          <div className="mt-4 max-w-md rounded-sm border border-[color:var(--danger)]/60 bg-[color:var(--danger)]/10 px-4 py-3 text-xs leading-relaxed text-[color:var(--danger)]">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onTextFallback}
          className="mt-6 text-xs tracking-[0.25em] text-[color:var(--text-sub)] underline-offset-4 hover:text-[color:var(--accent-bright)] hover:underline"
        >
          マイクを使わずテキスト入力で進める →
        </button>
      </div>
    </div>
  );
}
