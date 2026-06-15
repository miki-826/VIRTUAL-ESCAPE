export type GamePhase =
  | "title"
  | "howto"
  | "opening"
  | "micCheck"
  | "loading"
  | "playing"
  | "analyzing"
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

export type ChallengeType = "VOICE_REACTION" | "TEXT_REACTION" | "NOISE_REACTION";

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
  keywords?: string[];
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
  signals: string[];
  elapsedSec: number;
};

export type Rank = "S" | "A" | "B" | "C" | "D";

export type GameResult = {
  totalScore: number;
  rank: Rank;
  success: boolean;
  title: string;
  aiComment: string;
  goodPoints: string[];
  improvements: string[];
};

export type StartResponse = {
  sessionId: string;
  mockMode: boolean;
  challenges: Challenge[];
  timeLimitSec: number;
};

export type AnswerResponse = {
  score: number;
  maxScore: number;
  comment: string;
  signals: string[];
};
