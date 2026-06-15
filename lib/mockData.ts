import type { Challenge } from "@/types/game";

export const TIME_LIMIT_SEC = 180;
export const SUCCESS_THRESHOLD = 60;
export const TOTAL_ROUNDS = 5;

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "monday_delay",
    round: 1,
    category: "FATIGUE",
    type: "VOICE_REACTION",
    title: "疲労反応認証",
    situation:
      "月曜日の朝。電車は遅延。スマホの充電は残り3%。上司から「今どこ？」と通知が来ました。",
    instruction:
      "この状況で、最初に出そうな声を録音してください。言葉にならない反応でも構いません。",
    examples: ["はぁ……もう無理", "あー、終わった", "なんで今日に限って……"],
    judgeFocus: ["ため息", "疲労感", "諦め", "音量の減衰"],
    keywords: ["無理", "終わった", "はぁ", "なんで", "きつい", "最悪"],
  },
  {
    id: "convenience_chopsticks",
    round: 2,
    category: "DAILY_LIFE",
    type: "VOICE_REACTION",
    title: "生活感認証",
    situation:
      "コンビニでお弁当を買いました。家に帰って開けたら、箸が入っていませんでした。",
    instruction: "このとき、人間が思わずこぼす一言を録音してください。",
    examples: ["いや、箸ないんかい", "もう取りに戻る気力ないって", "今日そういう日か……"],
    judgeFocus: ["生活感", "小さい絶望", "具体性", "雑さ"],
    keywords: ["箸", "ない", "取りに戻る", "気力", "なんで", "今日"],
  },
  {
    id: "overslept",
    round: 3,
    category: "EXCUSE",
    type: "VOICE_REACTION",
    title: "言い訳認証",
    situation:
      "朝起きたら、始業時間を10分過ぎていました。上司から「大丈夫？」とメッセージが来ています。",
    instruction: "できるだけ人間らしい、少し情けない返答を録音してください。",
    examples: [
      "すみません、今起きました……",
      "完全にアラーム止めてました",
      "言い訳できないです、寝坊です",
    ],
    judgeFocus: ["情けなさ", "焦り", "現実味", "完璧すぎなさ"],
    keywords: ["すみません", "今起き", "寝坊", "アラーム", "ごめんなさい", "完全に"],
  },
  {
    id: "message_mistake",
    round: 4,
    category: "EMOTION_BUG",
    type: "VOICE_REACTION",
    title: "感情バグ認証",
    situation: "まだ書き途中のメッセージを、間違えて送信してしまいました。",
    instruction: "その瞬間の反応を録音してください。",
    examples: ["あ、送った", "待って、今のなし", "終わった……"],
    judgeFocus: ["瞬間的な焦り", "ミスへの反応", "短さ", "後悔"],
    keywords: ["あ", "待って", "送った", "なし", "終わった", "やばい", "ミス"],
  },
  {
    id: "real_noise_desk",
    round: 5,
    category: "REAL_NOISE",
    type: "NOISE_REACTION",
    title: "現実ノイズ認証",
    situation: "管理AIは、あなたが現実世界と接続している証拠を要求しています。",
    instruction:
      "近くにある物を使って、現実の音を録音してください。机、キーボード、紙などで構いません。",
    examples: ["机を軽く叩く", "キーボードを打つ", "紙をこする"],
    judgeFocus: ["物理音", "音量ピーク", "無音率", "現実音らしさ"],
    keywords: ["机", "叩く", "キーボード", "紙", "こする", "クリック", "ペットボトル"],
  },
];

export const RESULT_COMMENTS = {
  high: "音声に揺らぎ、間、生活感が検出されました。人間として十分な反応です。",
  middle:
    "反応は自然ですが、少し整いすぎています。より短い声や生活音で認証精度が向上します。",
  low: "音声または回答が合理的すぎます。人間は通常、もう少し無駄な感情やノイズを漏らします。",
};

export const STORY =
  "大型アップデート中、ひとりの人間が電子空間に取り残された。ログアウトには管理AIの人間性認証を突破する必要がある。";
