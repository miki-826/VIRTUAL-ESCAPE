# VIRTUAL ESCAPE

> 残り3分。声と現実音で、人間であることを証明せよ。

電子空間に取り残された人間を救う3分制の人間性認証Webゲーム。MediaRecorder API でマイク録音し、Web Audio API で音量・無音率・ピーク・変化量などの特徴量を解析。OpenAI API がある場合は AI 判定、ない場合は Mock 判定で最後まで遊べます。

## 主な機能

- 5問の人間性認証課題（疲労 / 生活感 / 言い訳 / 感情バグ / 現実ノイズ）
- 3分カウントダウン
- マイク録音 + 波形ライブ表示 + 10秒オートストップ
- 録音プレビュー再生 / 補足テキスト入力 / マイク拒否時のテキストフォールバック
- Web Audio API による音声特徴量解析（durationSec / averageVolume / peakVolume / silenceRatio / volumeVariance / burstCount）
- BGM 音量スライダー + ミュート + 録音中の自動ダッキング
- 結果画面でランク（S/A/B/C/D）・称号・管理AIコメント表示
- LocalStorage に結果と履歴を保存
- Supabase 接続時のみ DB 保存（未接続なら自動スキップ）

## セットアップ

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # webpack ビルド
```

> NOTE: 本リポジトリのパスに日本語が含まれると Turbopack が落ちるため、`dev` / `build` は `--webpack` 指定にしています。

環境変数は未設定でも Mock Mode で動きます。

```env
OPENAI_API_KEY=sk-...        # 任意。なければ Mock 判定
OPENAI_MODEL=gpt-4o-mini     # 任意
NEXT_PUBLIC_SUPABASE_URL=    # 任意
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Supabase を使う場合は `supabase.sql` を SQL Editor で実行してください（匿名 insert/select を許可する RLS ポリシー付き）。

## デプロイ

Vercel に Import → 必要なら環境変数を設定（任意）→ Deploy。
