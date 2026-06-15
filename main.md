以下をそのまま `main.md` として保存してください。音声解析をMVP必須機能として組み込み直しました。元ストーリー・出題カテゴリ・5問構成は添付内容を反映しています。

````markdown
# VIRTUAL ESCAPE — main.md

## 0. プロジェクト基本情報

| 項目 | 内容 |
|---|---|
| アプリ名 | VIRTUAL ESCAPE |
| 英語名 | VIRTUAL ESCAPE |
| ジャンル | AI人間性認証・音声解析付き短時間脱出ゲーム |
| 想定プレイ時間 | 3分 |
| 開発目的 | 電子空間に取り残された人間を救うため、声・一言・現実音を解析して人間性認証を突破するWebゲームを作る |
| GitHub Repository | `https://github.com/miki-826/VIRTUAL-ESCAPE.git` |
| デプロイ予定 | Vercel |
| 使用技術 | Next.js App Router / TypeScript / Tailwind CSS / Web Audio API / MediaRecorder API / OpenAI API / Supabase / LocalStorage |
| 最優先方針 | 3時間ハッカソンで、音声解析込みでもAPIキーなし・Supabaseなしで1プレイ完結するMVPを完成させる |

---

## 1. 一言コンセプト

残り3分。  
声・ため息・生活音で、人間であることを証明せよ。  
AIと見分けがつかなくなった人間を、現実へログアウトさせる認証ゲーム。

---

## 2. アプリ概要

`VIRTUAL ESCAPE` は、人間とAIが電子空間上では同じ「ユーザー」として扱われる世界を舞台にした、3分制の人間性認証ゲームです。

大型アップデート中に、一人の人間が電子空間へ取り残されます。3分以内にログアウトできなければ、その人間は正常に現実へ戻れません。

ログアウトには、管理AIによる人間性認証が必要です。

プレイヤーは、取り残された人間の協力者として、管理AIが提示する5つの認証課題に答えます。課題は、日常の不満、疲労、言い訳、感情的なミス、現実世界の音などです。

このアプリでは、テキスト回答だけでなく、ブラウザのマイクを使った音声録音と簡易音声解析をMVPに含めます。

音声解析では以下を扱います。

- 録音時間
- 音量ピーク
- 平均音量
- 無音率
- 音量変化
- 物理音らしさ
- 短い反応らしさ
- 現実ノイズ認証の補助判定

OpenAI APIは、回答の自然さや人間らしさの判定に使います。ただし、APIキーがない場合やAPIが失敗した場合でも、Web Audio APIで取得した音声特徴量とMock判定で最後まで遊べます。

Supabaseも必須ではありません。接続されている場合のみ保存し、未接続時はLocalStorageに保存します。

---

## 3. コア体験

```text
タイトル画面
↓
電子空間に取り残された人間の状況を表示
↓
ログアウト管理AIが人間性認証課題を提示
↓
ユーザーが声・一言・現実音を録音する
↓
ブラウザで音声特徴量を解析する
↓
AIまたはMock判定が人間反応率を採点する
↓
5問終了または3分経過
↓
ログアウト成功 / 失敗の結果表示
````

---

## 4. MVP必須機能

| 優先度    | 機能             | 内容                                |
| ------ | -------------- | --------------------------------- |
| Must   | タイトル画面         | 世界観、3分制、ゲーム開始ボタンを表示               |
| Must   | 遊び方画面          | 声・一言・生活音で認証を突破するルールを説明            |
| Must   | メイン体験画面        | 認証課題、状況、指示、進捗、残り時間を表示             |
| Must   | マイク録音          | MediaRecorder APIで音声を録音する         |
| Must   | 音声解析           | Web Audio APIで音量・無音率・ピーク・変化量を解析する |
| Must   | ユーザー入力         | 音声録音を基本入力にし、必要に応じてテキスト補足も受け付ける    |
| Must   | AI応答または判定      | OpenAI APIまたはMock判定でスコアを返す        |
| Must   | 結果画面           | 人間反応率、ランク、管理AIコメント、ログアウト結果を表示     |
| Must   | Mock Mode      | APIキーなしでも固定5問・音声特徴量判定で1プレイ完結      |
| Must   | LocalStorage保存 | 直近スコア、最高スコア、プレイ履歴を保存              |
| Must   | レスポンシブ対応       | スマホでも録音ボタンを押しやすくする                |
| Should | 解析演出           | 波形・スキャン・認証中表示                     |
| Should | 録音プレビュー        | 録音後に再生確認できる                       |
| Could  | Supabase保存     | 接続されている場合のみ結果を保存                  |

---

## 5. 後回しにする機能

| 機能       | 後回しにする理由              |
| -------- | --------------------- |
| ログイン     | 3時間MVPでは不要            |
| ランキング    | DBと不正対策が必要になるため不要     |
| SNS共有    | コア体験後でよい              |
| 複雑なDB    | Supabase未接続でも動くことを優先  |
| 課金       | ハッカソンMVPでは不要          |
| 管理画面     | 不要                    |
| 完全な音声認識  | Whisper等の文字起こしは必須にしない |
| 高度な感情認識  | ブラウザでの簡易特徴量解析を優先      |
| リアルタイム対戦 | 実装コストが高い              |
| 長時間ステージ  | 3分体験を優先               |

---

## 6. 画面一覧

MVPでは実装速度を優先し、`/` の1ページ内で `phase` によって状態切り替えするSPA風実装でよいです。

| 画面名    | パス例 | 内容                     |
| ------ | --- | ---------------------- |
| タイトル   | `/` | タイトル、世界観、開始ボタン         |
| 遊び方    | `/` | 録音許可、3分制、5問認証の説明       |
| オープニング | `/` | 電子空間に人間が取り残されたストーリー    |
| マイク確認  | `/` | マイク許可、録音テスト、失敗時フォールバック |
| 認証画面   | `/` | 課題カード、録音ボタン、波形、補足入力欄   |
| 解析中    | `/` | 音声解析とAI判定の演出           |
| 中間判定   | `/` | 各問のスコアと短いコメント          |
| 結果     | `/` | 総合スコア、ランク、ログアウト成否      |

---

## 7. UIデザイン方針

| 項目      | 内容                                               |
| ------- | ------------------------------------------------ |
| テーマ     | 電子空間、ログアウト認証、AI管理システム、緊急脱出                       |
| キーワード   | cyber, terminal, voice scan, human noise, logout |
| 見た目の方向性 | 暗い背景にネオンブルー、警告レッド、音声波形UI                         |
| UI演出    | グリッチ、スキャンライン、波形アニメーション、認証ゲージ                     |
| 読みやすさ   | 課題文と録音ボタンを最優先に見せる                                |
| 音声UI    | 録音中は赤いパルス、解析中はシアンの波形                             |
| スマホ対応   | 録音ボタンを画面下部に大きく固定                                 |
| 体験速度    | 45秒以内に最初の認証へ到達                                   |

---

## 8. カラーパレット

| 用途       | 色名                 | HEX       |
| -------- | ------------------ | --------- |
| 背景       | Deep Virtual Black | `#050816` |
| パネル背景    | Terminal Navy      | `#0B1026` |
| メイン文字    | Cold White         | `#F4F7FB` |
| サブ文字     | Soft Blue Gray     | `#9CA8C7` |
| アクセント色   | Neon Cyan          | `#22D3EE` |
| 録音中      | Recording Red      | `#EF4444` |
| 警告色      | Emergency Red      | `#F43F5E` |
| 成功色      | Logout Green       | `#34D399` |
| 境界線      | System Border      | `#24304F` |
| ボタン背景    | Cyber Blue         | `#2563EB` |
| ボタンHover | Bright Cyber Blue  | `#3B82F6` |
| 解析中      | Scan Purple        | `#A855F7` |
| 波形       | Voice Cyan         | `#67E8F9` |

---

## 9. 主要UI文言

```text
タイトル:
VIRTUAL ESCAPE

サブコピー:
残り3分。
声と現実音で、人間であることを証明せよ。

開始ボタン:
認証を開始する

マイク許可:
マイクを有効にする

録音開始:
反応を録音する

録音停止:
録音を停止する

再録音:
もう一度録音する

送信:
この反応を提出

解析中:
音声特徴量を解析中...

AI判定中:
LOGOUT MANAGER AI が人間反応を判定中...

次へ:
次の認証へ

結果:
ログアウト判定を見る

もう一度:
もう一度救出する
```

---

## 10. 遊び方テキスト

```text
あなたは、電子空間に取り残された人間の協力者です。

ログアウト管理AIは、対象ユーザーが本当に人間かどうかを疑っています。

3分以内に5つの人間性認証を突破してください。

各認証では、提示された状況に対して、
人間が思わず出しそうな声・一言・独り言・生活音を録音します。

完璧な回答はいりません。
むしろ、疲れ・迷い・しょうもなさ・生活感・現実のノイズがあるほど高評価です。

マイクが使えない場合は、テキスト入力で代替できます。
APIキーが未設定でも、Mock Modeで最後まで遊べます。
```

---

## 11. ゲーム画面レイアウト

### PC表示

```text
┌──────────────────────────────────────────────┐
│ VIRTUAL ESCAPE                 残り 02:41    │
├──────────────────────────────────────────────┤
│ HUMANITY CHECK #02 / 05                      │
│ 生活感認証                                   │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 状況                                     │ │
│ │ コンビニでお弁当を買いました。           │ │
│ │ 家に帰って開けたら、箸がありません。     │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ 指示                                         │
│ このとき、人間が思わずこぼす一言を録音...    │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │  音声波形  ∿∿∿∿∿∿∿∿∿∿                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [● 録音開始] [停止] [再生]                  │
│                                              │
│ 補足テキスト任意:                            │
│ ┌──────────────────────────────────────────┐ │
│ │ 例: いや、箸ないんかい                   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [この反応を提出]                             │
└──────────────────────────────────────────────┘
```

### スマホ表示

```text
┌────────────────────┐
│ VIRTUAL ESCAPE     │
│ 残り 02:41         │
├────────────────────┤
│ CHECK #02 / 05     │
│ 生活感認証         │
│                    │
│ 状況               │
│ コンビニで弁当を...│
│ 箸がありません。   │
│                    │
│ 指示               │
│ 思わず出る一言を   │
│ 録音してください。 │
│                    │
│ ∿∿∿∿∿∿∿∿∿        │
│                    │
│ [● 録音する]       │
│ [停止] [再生]      │
│                    │
│ 補足入力           │
│ ┌────────────────┐ │
│ │                │ │
│ └────────────────┘ │
│                    │
│ [提出]             │
└────────────────────┘
```

---

## 12. 結果画面レイアウト

表示項目:

```text
ログアウト判定
人間反応率
総合スコア
ランク
称号
管理AIコメント
音声解析サマリー
良かった点
改善点
各問のスコア一覧
もう一度遊ぶボタン
```

### レイアウト

```text
┌────────────────────────────────────┐
│ LOGOUT RESULT                      │
│                                    │
│ 判定: LOGOUT SUCCESS               │
│ 人間反応率: 86%                    │
│ ランク: A                          │
│ 称号: 生活音を持つ現実存在         │
│                                    │
│ 音声解析                           │
│ 平均音量: 中                       │
│ 無音率: 18%                        │
│ 現実ノイズ検出: あり               │
│                                    │
│ 管理AIコメント                     │
│ 「短く、雑で、少し疲れています。   │
│  人間反応として十分です。」         │
│                                    │
│ [もう一度救出する]                 │
└────────────────────────────────────┘
```

---

## 13. 評価・スコア・ランク設計

### 各問20点

| 評価軸     | 点数 | 内容               |
| ------- | -: | ---------------- |
| 音声入力成立  |  3 | 録音が存在し、長さが適切か    |
| 音量・無音率  |  4 | 無音すぎず、ピークや変化があるか |
| 反応の自然さ  |  4 | 状況に対して自然な声・音か    |
| 具体性     |  3 | 状況に合った補足・反応か     |
| 人間らしい弱さ |  4 | 疲れ、焦り、後悔、雑さがあるか  |
| 短さ・瞬発力  |  2 | 思わず出た反応らしいか      |

### 総合ランク

|    スコア | ランク | 称号          | 判定             |
| -----: | --- | ----------- | -------------- |
| 90〜100 | S   | 極めて人間的なノイズ源 | LOGOUT SUCCESS |
|  75〜89 | A   | 生活音を持つ現実存在  | LOGOUT SUCCESS |
|  60〜74 | B   | おおむね人間      | LOGOUT SUCCESS |
|  40〜59 | C   | 仮想人格疑惑あり    | LOGOUT WARNING |
|   0〜39 | D   | AI応答の可能性が高い | LOGOUT FAILED  |

---

## 14. Mock Mode要件

### Mock Modeに切り替える条件

```text
OPENAI_API_KEY がない
Supabase環境変数がない
OpenAI APIエラー
OpenAI APIタイムアウト
JSON parse失敗
Vercel本番で環境変数未設定
API Routeで例外発生
ネットワークエラー
```

### Mock Modeでも必ず実装すること

```text
固定の5問を表示する
MediaRecorder APIで録音する
Web Audio APIで音声特徴量を解析する
音声特徴量と補足テキストで簡易判定する
結果画面まで進める
LocalStorageに保存する
Supabase保存はスキップする
画像がなくてもCSS背景で表示する
BGMや動画がなくても動く
```

### マイクが使えない場合のフォールバック

```text
マイク権限拒否
ブラウザ非対応
録音失敗
AudioContext生成失敗
音声ファイル解析失敗
```

上記の場合は、音声入力の代わりにテキスト回答モードへ切り替えます。

表示文言:

```text
マイクを利用できませんでした。
このプレイでは、テキスト反応で人間性認証を続行します。
```

---

## 15. Mock正解データ

```json
{
  "id": "mock-virtual-escape-voice-001",
  "title": "VIRTUAL ESCAPE Voice Mock Session",
  "timeLimitSec": 180,
  "totalRounds": 5,
  "story": "大型アップデート中、ひとりの人間が電子空間に取り残された。ログアウトには管理AIの人間性認証を突破する必要がある。",
  "successThreshold": 60,
  "challenges": [
    {
      "id": "monday_delay",
      "round": 1,
      "category": "FATIGUE",
      "type": "VOICE_REACTION",
      "title": "疲労反応認証",
      "situation": "月曜日の朝。電車は遅延。スマホの充電は残り3%。上司から「今どこ？」と通知が来ました。",
      "instruction": "この状況で、最初に出そうな声を録音してください。言葉にならない反応でも構いません。",
      "examples": ["はぁ……もう無理", "あー、終わった", "なんで今日に限って……"],
      "judgeFocus": ["ため息", "疲労感", "諦め", "音量の減衰"],
      "keywords": ["無理", "終わった", "はぁ", "なんで", "きつい", "最悪"]
    },
    {
      "id": "convenience_chopsticks",
      "round": 2,
      "category": "DAILY_LIFE",
      "type": "VOICE_REACTION",
      "title": "生活感認証",
      "situation": "コンビニでお弁当を買いました。家に帰って開けたら、箸が入っていませんでした。",
      "instruction": "このとき、人間が思わずこぼす一言を録音してください。",
      "examples": ["いや、箸ないんかい", "もう取りに戻る気力ないって", "今日そういう日か……"],
      "judgeFocus": ["生活感", "小さい絶望", "具体性", "雑さ"],
      "keywords": ["箸", "ない", "取りに戻る", "気力", "なんで", "今日"]
    },
    {
      "id": "overslept",
      "round": 3,
      "category": "EXCUSE",
      "type": "VOICE_REACTION",
      "title": "言い訳認証",
      "situation": "朝起きたら、始業時間を10分過ぎていました。上司から「大丈夫？」とメッセージが来ています。",
      "instruction": "できるだけ人間らしい、少し情けない返答を録音してください。",
      "examples": ["すみません、今起きました……", "完全にアラーム止めてました", "言い訳できないです、寝坊です"],
      "judgeFocus": ["情けなさ", "焦り", "現実味", "完璧すぎなさ"],
      "keywords": ["すみません", "今起き", "寝坊", "アラーム", "ごめんなさい", "完全に"]
    },
    {
      "id": "message_mistake",
      "round": 4,
      "category": "EMOTION_BUG",
      "type": "VOICE_REACTION",
      "title": "感情バグ認証",
      "situation": "まだ書き途中のメッセージを、間違えて送信してしまいました。",
      "instruction": "その瞬間の反応を録音してください。",
      "examples": ["あ、送った", "待って、今のなし", "終わった……"],
      "judgeFocus": ["瞬間的な焦り", "ミスへの反応", "短さ", "後悔"],
      "keywords": ["あ", "待って", "送った", "なし", "終わった", "やばい", "ミス"]
    },
    {
      "id": "real_noise_desk",
      "round": 5,
      "category": "REAL_NOISE",
      "type": "NOISE_REACTION",
      "title": "現実ノイズ認証",
      "situation": "管理AIは、あなたが現実世界と接続している証拠を要求しています。",
      "instruction": "近くにある物を使って、現実の音を録音してください。机、キーボード、紙などで構いません。",
      "examples": ["机を軽く叩く", "キーボードを打つ", "紙をこする"],
      "judgeFocus": ["物理音", "音量ピーク", "無音率", "現実音らしさ"],
      "keywords": ["机", "叩く", "キーボード", "紙", "こする", "クリック", "ペットボトル"]
    }
  ],
  "resultComments": {
    "high": "音声に揺らぎ、間、生活感が検出されました。人間として十分な反応です。",
    "middle": "反応は自然ですが、少し整いすぎています。より短い声や生活音で認証精度が向上します。",
    "low": "音声または回答が合理的すぎます。人間は通常、もう少し無駄な感情やノイズを漏らします。"
  }
}
```

---

## 16. Mock判定ロジック

### 音声特徴量

ブラウザ側で以下を算出します。

```ts
export type AudioFeatures = {
  durationSec: number;
  averageVolume: number;
  peakVolume: number;
  silenceRatio: number;
  volumeVariance: number;
  burstCount: number;
  hasAudio: boolean;
};
```

### 判定方針

```text
録音が存在する: +3
録音時間が1〜8秒: +3
平均音量が一定以上: +3
ピーク音量がある: +3
無音率が高すぎない: +3
音量変化がある: +2
補足テキストが状況に合う: +3
長すぎる・整いすぎる文章は減点
```

### TypeScript例

```ts
export function judgeMockAnswer(params: {
  answerText: string;
  keywords: string[];
  audioFeatures: AudioFeatures | null;
  challengeType: "VOICE_REACTION" | "TEXT_REACTION" | "NOISE_REACTION";
}): {
  score: number;
  comment: string;
  signals: string[];
} {
  const { answerText, keywords, audioFeatures, challengeType } = params;
  const text = answerText.trim();
  const signals: string[] = [];
  let score = 0;

  if (audioFeatures?.hasAudio) {
    score += 3;
    signals.push("録音検出");

    if (audioFeatures.durationSec >= 1 && audioFeatures.durationSec <= 8) {
      score += 3;
      signals.push("短い反応");
    }

    if (audioFeatures.averageVolume > 0.015) {
      score += 3;
      signals.push("音量あり");
    }

    if (audioFeatures.peakVolume > 0.08) {
      score += 3;
      signals.push("音量ピーク検出");
    }

    if (audioFeatures.silenceRatio < 0.7) {
      score += 3;
      signals.push("無音率正常");
    }

    if (audioFeatures.volumeVariance > 0.005 || audioFeatures.burstCount >= 1) {
      score += 2;
      signals.push("音量変化あり");
    }
  }

  if (text.length >= 1 && text.length <= 40) {
    score += 2;
    signals.push("短い補足");
  }

  const hitCount = keywords.filter((keyword) => text.includes(keyword)).length;
  if (hitCount > 0) {
    score += Math.min(hitCount * 2, 4);
    signals.push("状況キーワード一致");
  }

  const humanNoises = ["…", "はぁ", "あ", "いや", "なんで", "無理", "終わった", "待って", "もう"];
  if (humanNoises.some((word) => text.includes(word))) {
    score += 2;
    signals.push("口語的反応");
  }

  if (!audioFeatures?.hasAudio && !text) {
    score = 0;
    signals.push("未入力");
  }

  if (text.length > 80) {
    score -= 3;
    signals.push("説明が長い");
  }

  if (challengeType === "NOISE_REACTION" && audioFeatures?.peakVolume && audioFeatures.peakVolume > 0.12) {
    score += 2;
    signals.push("現実ノイズらしいピーク");
  }

  const finalScore = Math.max(0, Math.min(20, score));

  return {
    score: finalScore,
    comment:
      finalScore >= 16
        ? "音声と反応に人間らしい揺らぎが検出されました。"
        : finalScore >= 10
          ? "認証可能な反応ですが、少し整っています。"
          : "音声または反応が不足しています。より短く自然な反応が必要です。",
    signals,
  };
}
```

---

## 17. OpenAI API使用箇所

| 用途          | Endpoint                | 内容                     | 失敗時            |
| ----------- | ----------------------- | ---------------------- | -------------- |
| 課題生成        | `POST /api/game/start`  | 5問の認証課題を生成             | Mock課題を返す      |
| 音声特徴量付き回答判定 | `POST /api/game/answer` | テキスト補足と音声特徴量から人間らしさを採点 | Mock判定を使う      |
| 最終結果生成      | `POST /api/game/result` | 総合コメントと称号を生成           | 固定コメントを使う      |
| 画像生成        | `gen-image.mjs`         | 背景・AIアイコン画像を生成         | CSS背景で代替       |
| 音声解析        | クライアント処理                | Web Audio APIで特徴量を算出   | テキスト入力へフォールバック |

音声ファイルそのものをOpenAIへ送信する必要はありません。MVPでは、ブラウザで解析した特徴量と補足テキストのみをAPIへ送ります。

---

## 18. API設計

### POST /api/game/start

| 項目       | 内容                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------ |
| Endpoint | `POST /api/game/start`                                                                           |
| Request  | `{ "mode": "auto" }`                                                                             |
| Response | `{ "sessionId": "string", "mockMode": boolean, "challenges": Challenge[], "timeLimitSec": 180 }` |
| 注意点      | APIキーなしならMock課題を返す                                                                               |

### POST /api/game/answer

| 項目       | 内容                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint | `POST /api/game/answer`                                                                                                            |
| Request  | `{ "sessionId": "string", "challengeId": "string", "answerText": "string", "audioFeatures": AudioFeatures, "elapsedSec": number }` |
| Response | `{ "score": number, "maxScore": 20, "comment": "string", "signals": string[] }`                                                    |
| 注意点      | 音声ファイルは送らず、特徴量のみ送る。失敗時はMock判定                                                                                                      |

### POST /api/game/result

| 項目       | 内容                                                  |     |     |     |                                                                                                                        |
| -------- | --------------------------------------------------- | --- | --- | --- | ---------------------------------------------------------------------------------------------------------------------- |
| Endpoint | `POST /api/game/result`                             |     |     |     |                                                                                                                        |
| Request  | `{ "sessionId": "string", "answers": AnswerLog[] }` |     |     |     |                                                                                                                        |
| Response | `{ "totalScore": number, "rank": "S"                | "A" | "B" | "C" | "D", "success": boolean, "title": "string", "aiComment": "string", "goodPoints": string[], "improvements": string[] }` |
| 注意点      | Supabase接続時のみDB保存。未接続ならLocalStorage保存               |     |     |     |                                                                                                                        |

---

## 19. OpenAI用プロンプト

### 生成用プロンプト

```text
あなたは、短時間Webゲーム「VIRTUAL ESCAPE」のログアウト管理AIです。

世界観:
人間とAIが電子空間上では同じ「ユーザー」として扱われる世界。
大型アップデート中に一人の人間が電子空間へ取り残された。
3分以内にログアウトできなければ、その人間は正常に現実へ戻れない。
ログアウトには、人間性認証が必要。

目的:
プレイヤーに5つの人間性認証課題を出してください。

課題カテゴリ:
- FATIGUE
- DAILY_LIFE
- EXCUSE
- EMOTION_BUG
- REAL_NOISE

要件:
- 5問生成する
- 声または現実音で答えられる課題にする
- 1問あたり30秒以内に答えられる
- 状況は日本語で具体的に書く
- 例文を3つ入れる
- judgeFocusを3〜5個入れる
- 不快すぎる内容、差別、犯罪、医療、政治、性的内容は避ける

出力は必ずJSONのみ。
Markdownは禁止。
```

### 応答用プロンプト

```text
あなたはログアウト管理AIです。

プレイヤーは、電子空間に取り残された人間を救うため、
提示された状況に対する「声」「一言」「現実音」を提出します。

以下の情報を評価してください。

入力:
- 課題カテゴリ
- 状況
- 指示
- 補足テキスト
- 音声特徴量

音声特徴量:
- durationSec
- averageVolume
- peakVolume
- silenceRatio
- volumeVariance
- burstCount
- hasAudio

評価方針:
- 録音が成立しているか
- 音量や無音率が自然か
- 状況に対して具体的か
- 整いすぎていないか
- 人間らしい弱さ、疲れ、迷い、後悔があるか
- REAL_NOISEでは物理音らしいピークや変化があるか

これは本人確認や心理診断ではなく、ゲーム演出です。

返すJSON:
{
  "score": number,
  "maxScore": 20,
  "comment": string,
  "signals": string[]
}

出力は必ずJSONのみ。
Markdownは禁止。
```

### 判定用プロンプト

```text
あなたはログアウト管理AIです。

5問分の回答結果と音声解析結果をもとに、
対象ユーザーが人間としてログアウト可能かをゲーム内判定してください。

判定基準:
- totalScore が60以上なら成功
- 90以上: S
- 75以上: A
- 60以上: B
- 40以上: C
- 39以下: D

コメント方針:
- SF世界観に合う
- 音声、間、ノイズ、生活感に触れる
- 皮肉を少し含めてよい
- プレイヤーを傷つけない
- 本人確認や心理診断のように断定しない
- ゲーム演出として表現する

返すJSON:
{
  "totalScore": number,
  "rank": "S" | "A" | "B" | "C" | "D",
  "success": boolean,
  "title": string,
  "aiComment": string,
  "goodPoints": string[],
  "improvements": string[]
}

出力は必ずJSONのみ。
Markdownは禁止。
```

---

## 20. Supabase設計

Supabaseは必須ではありません。接続されている場合のみ保存します。

```sql
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  mock_mode boolean default false,
  time_limit_sec integer default 180,
  completed boolean default false
);

create table if not exists game_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references game_sessions(id) on delete cascade,
  challenge_id text not null,
  category text not null,
  answer_text text,
  score integer not null,
  max_score integer default 20,
  comment text,
  elapsed_sec integer,
  audio_duration_sec numeric,
  average_volume numeric,
  peak_volume numeric,
  silence_ratio numeric,
  volume_variance numeric,
  burst_count integer,
  created_at timestamptz default now()
);

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references game_sessions(id) on delete cascade,
  total_score integer not null,
  rank text not null,
  success boolean not null,
  title text,
  ai_comment text,
  created_at timestamptz default now()
);
```

音声ファイル本体はMVPでは保存しません。保存するのは音声特徴量のみです。

---

## 21. LocalStorage設計

```text
virtual_escape_last_result
virtual_escape_best_score
virtual_escape_history
virtual_escape_settings
```

```json
{
  "lastResult": {
    "sessionId": "local-1710000000000",
    "playedAt": "2026-01-01T00:00:00.000Z",
    "mockMode": true,
    "totalScore": 86,
    "rank": "A",
    "success": true,
    "answers": [
      {
        "challengeId": "real_noise_desk",
        "category": "REAL_NOISE",
        "answerText": "机を軽く叩いた",
        "score": 18,
        "comment": "物理音らしいピークが検出されました。",
        "audioFeatures": {
          "durationSec": 3.2,
          "averageVolume": 0.04,
          "peakVolume": 0.21,
          "silenceRatio": 0.22,
          "volumeVariance": 0.018,
          "burstCount": 3,
          "hasAudio": true
        }
      }
    ]
  },
  "bestScore": 92,
  "history": [
    {
      "playedAt": "2026-01-01T00:00:00.000Z",
      "totalScore": 86,
      "rank": "A",
      "success": true
    }
  ],
  "settings": {
    "soundEnabled": true,
    "reducedMotion": false,
    "micFallbackTextMode": false
  }
}
```

---

## 22. 状態管理

```ts
export type GamePhase =
  | "title"
  | "howto"
  | "opening"
  | "micCheck"
  | "loading"
  | "playing"
  | "recording"
  | "analyzingAudio"
  | "judging"
  | "roundResult"
  | "result";

export type ChallengeCategory =
  | "FATIGUE"
  | "DAILY_LIFE"
  | "EXCUSE"
  | "MUMBLE"
  | "REAL_NOISE"
  | "EMOTION_BUG"
  | "REGRET"
  | "SOCIAL";

export type ChallengeType =
  | "VOICE_REACTION"
  | "TEXT_REACTION"
  | "NOISE_REACTION";

export type Challenge = {
  id: string;
  round: number;
  category: ChallengeCategory;
  type: ChallengeType;
  title: string;
  situation: string;
  instruction: string;
  examples: string[];
  judgeFocus: string[];
};

export type AudioFeatures = {
  durationSec: number;
  averageVolume: number;
  peakVolume: number;
  silenceRatio: number;
  volumeVariance: number;
  burstCount: number;
  hasAudio: boolean;
};

export type AnswerLog = {
  challengeId: string;
  category: ChallengeCategory;
  answerText: string;
  audioFeatures: AudioFeatures | null;
  score: number;
  maxScore: number;
  comment: string;
  elapsedSec: number;
};

export type GameResult = {
  totalScore: number;
  rank: "S" | "A" | "B" | "C" | "D";
  success: boolean;
  title: string;
  aiComment: string;
  goodPoints: string[];
  improvements: string[];
};

export type GameState = {
  phase: GamePhase;
  sessionId: string;
  mockMode: boolean;
  micAvailable: boolean;
  textFallbackMode: boolean;
  timeLimitSec: number;
  remainingSec: number;
  currentRoundIndex: number;
  challenges: Challenge[];
  answers: AnswerLog[];
  currentInput: string;
  currentAudioBlob: Blob | null;
  currentAudioUrl: string | null;
  currentAudioFeatures: AudioFeatures | null;
  result: GameResult | null;
  error: string | null;
};
```

---

## 23. 画像生成指定

画像生成に失敗してもCSS背景で動作させます。

| 用途       | 保存先                             |      サイズ | 形式  | 優先度    | プロンプト                                                                                                                                                                                    |
| -------- | ------------------------------- | -------: | --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タイトル背景   | `public/images/title-bg.png`    | 1536x864 | PNG | High   | `dark cyber virtual space, emergency logout system, glowing blue grid, digital particles, cinematic web game background, center area clean for title text, no text, no logo`             |
| ゲーム背景    | `public/images/game-bg.png`     | 1536x864 | PNG | High   | `futuristic voice authentication terminal room, holographic waveform panels, neon cyan and deep navy, subtle glitch effect, web game background, readable center area, no text, no logo` |
| 結果背景     | `public/images/result-bg.png`   | 1536x864 | PNG | Medium | `digital escape portal opening, cyber logout gate, green and cyan light, dramatic but clean, web game background, center empty space, no text, no logo`                                  |
| 管理AIアイコン | `public/images/manager-ai.png`  |  512x512 | PNG | Medium | `abstract logout manager AI avatar, circular hologram, minimal robotic face, neon cyan, transparent feeling, no text, no logo`                                                           |
| 音声波形装飾   | `public/images/voice-wave.png`  | 1024x512 | PNG | Medium | `glowing audio waveform, cyber blue, transparent style, futuristic voice scan effect, web game ui element, no text, no logo`                                                             |
| 認証エフェクト  | `public/images/auth-effect.png` |  768x768 | PNG | Low    | `scanning authentication effect, circular HUD, cyber blue glow, transparent background style, web game effect, no text, no logo`                                                         |

---

## 24. BGM・音声素材

BGMと効果音は任意です。素材がない場合は無音で進行します。

```text
public/audio/bgm.mp3
public/audio/record-start.mp3
public/audio/record-stop.mp3
public/audio/scan.mp3
public/audio/correct.mp3
public/audio/wrong.mp3
public/audio/logout.mp3
```

方針:

```text
BGMが存在すれば再生
存在しなければ無音
自動再生失敗でもゲーム継続
録音中はBGM音量を下げる
録音したユーザー音声とBGMを混ぜない
```

---

## 25. 動画素材

動画は任意です。素材がない場合は結果カードのみ表示します。

```text
public/video/success.mp4
public/video/failed.mp4
```

方針:

```text
成功時にsuccess.mp4があれば表示
失敗時にfailed.mp4があれば表示
動画がなければCSSアニメーションで代替
動画読み込み失敗でも結果表示は止めない
```

---

## 26. エラー処理

| エラー              | 対応               |
| ---------------- | ---------------- |
| OpenAI APIキーなし   | Mock Modeに切り替える  |
| OpenAI API失敗     | Mock判定を実行        |
| Supabase未接続      | LocalStorage保存のみ |
| 画像未生成            | CSS背景で代替         |
| BGMなし            | 無音で継続            |
| 動画なし             | 結果カードのみ表示        |
| JSON parse失敗     | 固定JSONを使用        |
| マイク権限拒否          | テキスト回答モードへ切り替え   |
| MediaRecorder非対応 | テキスト回答モードへ切り替え   |
| AudioContext失敗   | 録音は使わずテキスト判定     |
| 録音が短すぎる          | 警告し、再録音または低スコア   |
| 録音が長すぎる          | 10秒で自動停止         |
| 無音               | 低スコアだがゲーム継続      |
| タイマー終了           | その時点で結果判定        |

---

## 27. セキュリティ要件

```text
OPENAI_API_KEY はサーバー側のみで使用する
クライアントにAPIキーを渡さない
.env* をGitに含めない
Supabase service_roleキーをクライアントで使わない
音声ファイル本体はMVPではサーバー保存しない
音声特徴量のみAPIへ送る
録音前にマイク使用目的を表示する
正解情報を不要なタイミングでフロントに返さない
入力文字数制限を行う
ユーザー入力をHTMLとして直接描画しない
個人情報を話さないよう注意文を表示する
```

---

## 28. 環境変数

未設定でもMock Modeで動きます。

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

判定:

```text
OPENAI_API_KEY が空なら OpenAI API を呼ばない
Supabase URL または ANON KEY が空なら DB保存しない
どちらも空でも npm run build が成功する
```

---

## 29. package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "gen:image": "node gen-image.mjs"
  }
}
```

---

## 30. ディレクトリ構成

```text
virtual-escape/
├─ app/
│  ├─ api/
│  │  └─ game/
│  │     ├─ start/
│  │     │  └─ route.ts
│  │     ├─ answer/
│  │     │  └─ route.ts
│  │     └─ result/
│  │        └─ route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ TitleScreen.tsx
│  ├─ HowToScreen.tsx
│  ├─ OpeningScreen.tsx
│  ├─ MicCheckScreen.tsx
│  ├─ GameScreen.tsx
│  ├─ ChallengeCard.tsx
│  ├─ Recorder.tsx
│  ├─ Waveform.tsx
│  ├─ AudioAnalysisPanel.tsx
│  ├─ Timer.tsx
│  ├─ AuthGauge.tsx
│  ├─ RoundResult.tsx
│  ├─ ResultScreen.tsx
│  └─ MockModeBadge.tsx
├─ hooks/
│  ├─ useRecorder.ts
│  ├─ useAudioAnalysis.ts
│  └─ useTimer.ts
├─ lib/
│  ├─ mockData.ts
│  ├─ mockJudge.ts
│  ├─ audioFeatures.ts
│  ├─ openai.ts
│  ├─ supabase.ts
│  ├─ storage.ts
│  ├─ score.ts
│  └─ utils.ts
├─ types/
│  └─ game.ts
├─ public/
│  ├─ images/
│  ├─ audio/
│  └─ video/
├─ gen-image.mjs
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md
```

---

## 31. 実装時の重要ルール

```text
まずMock Modeで完成させる
音声録音と音声特徴量解析をMVP必須として実装する
APIキーなしでビルド成功させる
Supabaseなしで1プレイ完結させる
マイクが使えない場合はテキスト回答で継続する
画像がなくてもUIが壊れない
npm run build を最優先する
45秒以内に最初の認証へ入る
録音は最大10秒で自動停止する
音声ファイル本体はサーバー保存しない
正解情報をフロントに不要に持たせない
```

---

## 32. 3時間ハッカソン想定の開発順

```text
0:00〜0:30
Next.js / Tailwind 初期化
画面phase設計
Mockデータ作成
タイトル・遊び方画面作成

0:30〜1:00
5問の認証画面を作成
タイマー実装
LocalStorage保存の土台作成

1:00〜1:30
MediaRecorder APIで録音機能を実装
録音開始・停止・再生UIを作成
マイク権限拒否時のテキストフォールバックを実装

1:30〜2:00
Web Audio APIで音声特徴量解析を実装
durationSec / averageVolume / peakVolume / silenceRatio / volumeVariance / burstCount を算出
Mock判定に音声特徴量を組み込む

2:00〜2:30
/api/game/start / answer / result を実装
OpenAI APIがあれば使用、なければMock Mode
結果画面とランク表示を完成

2:30〜3:00
レスポンシブ調整
エラー処理
Vercel build確認
発表用デモ導線確認
```

---

## 33. 発表用説明文

```text
VIRTUAL ESCAPEは、電子空間に取り残された人間を救うための3分制AI認証ゲームです。

この世界では、人間とAIが電子空間上で同じユーザーとして扱われます。
そのため、ログアウトするには、管理AIに対して人間らしい反応を提出する必要があります。

プレイヤーは、疲れた朝、箸のない弁当、寝坊の言い訳、誤送信の焦り、机やキーボードの現実音などを録音します。

このアプリでは、MediaRecorder APIで音声を録音し、Web Audio APIで音量ピーク、無音率、音量変化などを解析します。
さらにOpenAI APIが使える場合は、補足テキストと音声特徴量をもとに、人間らしさをAIが判定します。

APIキーがない場合でも、Mock Modeで固定課題と簡易音声解析により最後まで遊べるため、Vercel上でも安定してデモできます。
```

---

## 34. 受け入れ条件

```text
- [ ] npm run build が成功する
- [ ] APIキーなしで動く
- [ ] Supabaseなしで動く
- [ ] マイク録音ができる
- [ ] 録音開始・停止・再生ができる
- [ ] 音声特徴量を算出できる
- [ ] マイク拒否時にテキスト入力へ切り替わる
- [ ] 5問の認証を進められる
- [ ] 各問の判定が表示される
- [ ] 結果画面が表示される
- [ ] LocalStorageに結果が保存される
- [ ] スマホで崩れない
- [ ] GitHubにpushできる
- [ ] Vercelで表示できる
- [ ] 45秒以内にコア体験へ入れる
```

---

## 35. 最終ゴール

審査員がURLを開いたとき、45秒以内に最初の人間性認証へ入り、声・一言・現実音を録音し、音声解析とAI風判定によって「人間反応率」が表示されること。

APIキーやSupabaseが未設定でも、3分以内に5問を完走し、ログアウト成功または失敗の結果まで体験できること。

```
```
